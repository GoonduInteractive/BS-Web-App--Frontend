"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { LIBRARY } from "@/components/comics/ReadButton";
import { CART, useCart } from "@/components/merch/CartProvider";
import { EmptyCart } from "@/components/merch/CartView";
import { CheckoutForm, type CheckoutDetails } from "@/components/merch/CheckoutForm";
import { CheckoutSummary } from "@/components/merch/CheckoutSummary";
import { OrderConfirmed, type ConfirmState, type OrderSummary } from "@/components/merch/OrderConfirmed";
import { ApiError } from "@/lib/api/client";
import type { Place } from "@/lib/api/geo";
import type { FreeShippingPromo, Lga } from "@/lib/api/shipping";
import {
  getOrderSummary,
  getShippingInfo,
  getShippingQuote,
  isPaid,
  isStockRefusal,
  payForOrder,
  placeOrder,
  placeSlug,
  type PlacedOrder,
  type ShippingDetails,
} from "@/lib/api/store";
import { authHref } from "@/lib/utils/auth-links";
import { entryTotal, resolveCartLines } from "@/lib/utils/cart-entry";
import { needsShipping } from "@/lib/utils/comic-sales";
import type { Locale } from "@/lib/utils/locales";
import { colourLabel } from "@/lib/utils/merch-copy";
import type { Messages } from "@/lib/utils/messages";
import type { ComicFormat, ComicIssue, Product } from "@/types/merch";
import type { SavedAddress } from "@/types/profile";

/** The saved delivery details' cache key. */
const SHIPPING_INFO = ["store", "shipping-info"] as const;

/** Back from Paystack, the order is read again this often, this many times, before it's called pending. */
const RECHECK_EVERY = 3000;
const RECHECKS = 20;

/**
 * The order this tab placed and hasn't seen paid. Placing it emptied the cart,
 * and the API lists no player's orders, so this is the only way back to it.
 * A key in the browser, so it outlives Back from Paystack; storage being
 * blocked only loses that offer.
 */
const UNPAID_ORDER = "bs.checkout.unpaid";

function readUnpaid(): string | null {
  try {
    return sessionStorage.getItem(UNPAID_ORDER);
  } catch {
    return null;
  }
}

function writeUnpaid(id: string | null): void {
  try {
    if (id) sessionStorage.setItem(UNPAID_ORDER, id);
    else sessionStorage.removeItem(UNPAID_ORDER);
  } catch {
    // Nothing to tell the player: see above.
  }
}

/**
 * A placed order as the confirmation lists it. The API names each line by
 * variant only; the catalogue the page already has gives it a name ("Hoodie ·
 * Black · L", "Chapter One · Online"), else its SKU.
 */
function toSummary(order: PlacedOrder, products: readonly Product[], comics: readonly ComicIssue[], messages: Messages): OrderSummary {
  // An online chapter also says which, so the confirmation can open it in the reader.
  const describe = (variantId: string, sku: string): { name: string; read?: string } => {
    for (const p of products) {
      const v = p.variants?.find((x) => x.id === variantId);
      if (!v) continue;
      const colour = p.colours.find((c) => c.id === v.colourId);
      return { name: [p.copy.name, colour && colourLabel(colour, messages), v.size].filter(Boolean).join(" · ") };
    }
    for (const c of comics) {
      const format = (Object.keys(c.variants ?? {}) as ComicFormat[]).find((f) => c.variants?.[f] === variantId);
      if (format) {
        return { name: `${c.copy.title} · ${messages.merch.comics.formatNames[format]}`, ...(format === "online" && { read: c.slug }) };
      }
    }
    return { name: sku || "—" };
  };
  return {
    number: order.number,
    total: order.total,
    lines: order.lines.map((l) => ({ ...describe(l.variantId, l.sku), quantity: l.quantity, total: l.unitPrice * l.quantity })),
  };
}

/**
 * The API's saved details as the form's starting values. It names the state
 * and the local government; the form keys local governments by id.
 */
function toSaved(info: ShippingDetails | null, lgasByState: Record<string, readonly Lga[]>): SavedAddress | null {
  if (!info) return null;
  const state = Object.keys(lgasByState).find((s) => placeSlug(s) === placeSlug(info.state)) ?? "";
  const lgaId = lgasByState[state]?.find((l) => placeSlug(l.name) === placeSlug(info.lga))?.id ?? "";
  return {
    firstName: info.firstName,
    lastName: info.lastName,
    phone: info.phone,
    line1: info.address,
    city: info.city,
    zip: info.zip,
    state,
    lgaId,
    method: info.method,
  };
}

/**
 * Holds what the two checkout columns share: where the order is going. The
 * form reports its details; the summary prices shipping from them.
 *
 * The form starts from the player's saved details (`/v1/shipping/info`);
 * shipping is the API's quote for the method, state and local government
 * (`/v1/shipping/quote`, the admin's prices and free-shipping promotion);
 * PLACE ORDER sends the cart with where it goes (`/v1/orders/checkout`, which
 * also saves the details for next time) and goes to Paystack to pay. Paystack
 * comes back here with `?order=`, and the confirmation opens at once on
 * "confirming": the order is read back every few seconds, because it is
 * Paystack's webhook to the API that marks it paid, not the return. Paid, it
 * is confirmed with its items and the cart read again (now empty); still
 * unpaid after a minute, it says the payment hasn't been confirmed yet.
 *
 * PLACING THE ORDER EMPTIES THE API'S CART, before Paystack is even open, so
 * the cart here can be out of date: the order placed in another tab, or left
 * unpaid with Back. Checkout reads the cart on arrival, and again when the
 * browser restores it from its back/forward cache, and with nothing in it
 * draws the empty cart. An order left unpaid is offered instead, with PAY NOW;
 * so is one whose payment wouldn't start. PLACE ORDER stays busy until the
 * browser has left, as a second order would find the cart empty.
 */
export function CheckoutView({
  products,
  comics,
  countries,
  states,
  lgasByState,
  messages,
  locale,
}: {
  products: readonly Product[];
  comics: readonly ComicIssue[];
  countries: readonly Place[];
  states: readonly Place[];
  lgasByState: Record<string, readonly Lga[]>;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.merch.checkout;
  const { status } = useAuth();
  const router = useRouter();
  const queries = useQueryClient();
  const [details, setDetails] = useState<CheckoutDetails | null>(null);
  const [placeError, setPlaceError] = useState<string | null>(null);
  // The confirmation: where it stands, and the order it's about.
  const [result, setResult] = useState<{ state: ConfirmState; order: OrderSummary | null; id?: string } | null>(null);
  // Checkout has read the API's cart itself, so an empty one really is.
  const [cartRead, setCartRead] = useState(false);
  // On the way to Paystack: the page is still here until the browser has left it.
  const [leaving, setLeaving] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Online chapters ship nothing; only a garment or a printed comic needs a delivery method and address.
  const { lines, clear } = useCart();
  const ships = needsShipping(lines, comics);
  const itemTotal = resolveCartLines({ lines, products, comics, messages, locale }).reduce((sum, e) => sum + entryTotal(e), 0);

  const savedInfo = useQuery({ queryKey: SHIPPING_INFO, queryFn: getShippingInfo, enabled: status === "signed-in" });
  const prefill = toSaved(savedInfo.data ?? null, lgasByState);

  const method = details?.method ?? prefill?.method ?? "homeDelivery";
  const state = details?.state ?? "";
  const lgaName = lgasByState[state]?.find((l) => l.id === details?.lgaId)?.name;

  const quote = useQuery({
    queryKey: ["store", "shipping-quote", state, lgaName, method, itemTotal],
    queryFn: () => getShippingQuote({ state, lga: lgaName, method, itemTotal }),
    enabled: ships && !!state && !!lgaName,
    retry: false,
  });
  const quoteError = !quote.isError
    ? null
    : quote.error instanceof ApiError && quote.error.status === 404
      ? t.noRate
      : quote.error instanceof ApiError && quote.error.status === 0
        ? messages.auth.errors.network
        : messages.auth.errors.unknown;

  const rate = quote.data?.fee ?? null;
  const promo: FreeShippingPromo =
    quote.data?.freeFrom != null ? { enabled: true, minimumOrder: quote.data.freeFrom } : { enabled: false, minimumOrder: 0 };

  const failure = (e: unknown) =>
    isStockRefusal(e)
      ? messages.auth.errors.stock
      : e instanceof ApiError && e.status === 0
        ? messages.auth.errors.network
        : messages.auth.errors.unknown;

  const pay = useMutation({
    mutationFn: (orderId: string) => {
      const back = `${window.location.origin}/${locale}/merch/checkout?order=${encodeURIComponent(orderId)}`;
      return payForOrder(orderId, back);
    },
    onSuccess: (url) => {
      setLeaving(true);
      window.location.assign(url);
    },
    onError: (e) => setPayError(failure(e)),
  });

  const place = useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      writeUnpaid(order.id);
      pay.mutate(order.id, {
        // The order exists now and the cart is gone: only its payment needs trying again.
        onError: () => {
          setResult({ state: "unpaid", order: toSummary(order, products, comics, messages), id: order.id });
          clear();
        },
      });
    },
    onError: (e) => {
      if (!(e instanceof ApiError && e.status === 400 && /cart is empty/i.test(e.message))) return setPlaceError(failure(e));
      // The screen was out of date, so it's read again; this stays only if the items do.
      setPlaceError(t.cartGone);
      clear();
    },
  });

  const busy = place.isPending || pay.isPending || leaving;

  useEffect(() => {
    if (status !== "signed-in") return;
    const read = () => queries.invalidateQueries({ queryKey: CART }).then(() => setCartRead(true));
    void read();
    // Back from Paystack the browser may restore this page as it left it, cart and busy button included.
    const restored = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setLeaving(false);
      setCartRead(false);
      void read();
    };
    window.addEventListener("pageshow", restored);
    return () => window.removeEventListener("pageshow", restored);
  }, [status, queries]);

  // Back without paying, the cart has become an order: that order is offered.
  const cartEmpty = cartRead && lines.length === 0;
  useEffect(() => {
    if (!cartEmpty || busy || new URLSearchParams(window.location.search).has("order")) return;
    const id = readUnpaid();
    if (!id) return;
    let gone = false;
    getOrderSummary(id)
      .then((order) => {
        if (gone) return;
        if (isPaid(order) || order.status === "cancelled") return writeUnpaid(null);
        setResult({ state: "unpaid", order: toSummary(order, products, comics, messages), id });
      })
      // No order to offer, only the empty cart: nothing more to tell the player.
      .catch(() => {});
    return () => {
      gone = true;
    };
  }, [cartEmpty, busy, products, comics, messages]);

  useEffect(() => {
    if (status !== "signed-in") return;
    const id = new URLSearchParams(window.location.search).get("order");
    if (!id) return;
    let gone = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let checks = 0;
    const check = () =>
      getOrderSummary(id)
        .then((order) => {
          if (gone) return;
          if (order.status === "cancelled") return setResult(null);
          const summary = toSummary(order, products, comics, messages);
          if (isPaid(order)) {
            writeUnpaid(null);
            setResult({ state: "confirmed", order: summary });
            clear();
            // Chapters bought are the player's now: START READING on the Comics page reads the library afresh.
            void queries.invalidateQueries({ queryKey: LIBRARY });
          } else if (++checks < RECHECKS) {
            setResult({ state: "confirming", order: summary });
            timer = setTimeout(check, RECHECK_EVERY);
          } else setResult({ state: "pending", order: summary });
        })
        .catch(() => {
          if (!gone) setResult({ state: "pending", order: null });
        });
    // Opened on "confirming" straight away: the first read can take a while if the API is waking.
    timer = setTimeout(() => {
      setResult((r) => r ?? { state: "confirming", order: null });
      void check();
    }, 0);
    return () => {
      gone = true;
      clearTimeout(timer);
    };
  }, [status, clear, products, comics, messages, queries]);

  const submit = () => {
    if (status !== "signed-in") return router.push(authHref(locale, "sign-in", window.location.pathname));
    if (busy) return;
    if (!ships) return place.mutate(undefined);
    if (!details || !state || !lgaName) return setPlaceError(t.chooseLocation);
    // A place the admin hasn't priced already says so under the button; a quote on its way is waited for.
    if (!quote.data) return;
    const missing =
      !details.firstName.trim() ||
      !details.lastName.trim() ||
      !details.phone.trim() ||
      (method === "homeDelivery" && !details.line1.trim());
    if (missing) return setPlaceError(t.needDetails);
    place.mutate({
      method,
      firstName: details.firstName,
      lastName: details.lastName,
      phone: details.phone,
      address: details.line1,
      city: details.city,
      zip: details.zip,
      state,
      lga: lgaName,
    });
  };

  // Nothing to check out: the empty cart, not a form that ends in a refusal.
  if (cartEmpty && !result && !busy) return <EmptyCart messages={messages} locale={locale} />;

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[62.2%_35.3%] lg:justify-between lg:gap-0">
      <CheckoutForm
        // The form reads its starting values once: drawn again when the saved details arrive.
        key={savedInfo.data ? "saved" : "blank"}
        messages={messages}
        countries={countries}
        states={states}
        lgasByState={lgasByState}
        saved={prefill}
        shipping={ships}
        onDeliveryChange={() => setPlaceError(null)}
        onDetailsChange={setDetails}
      />
      <CheckoutSummary
        products={products}
        comics={comics}
        messages={messages}
        locale={locale}
        rate={rate}
        promo={promo}
        freeShipping={quote.data?.free}
        shipping={ships}
        placeError={placeError ?? quoteError}
        busy={busy}
        onPlaceOrder={() => {
          setPlaceError(null);
          submit();
        }}
      />

      <OrderConfirmed
        messages={messages}
        locale={locale}
        open={!!result}
        state={result?.state ?? "confirmed"}
        order={result?.order ?? null}
        // Back from Paystack the cart has become the order, so closing goes back to the store.
        onClose={() => router.replace(`/${locale}/merch`)}
        onPay={() => {
          setPayError(null);
          if (result?.id && !busy) pay.mutate(result.id);
        }}
        paying={busy}
        payError={payError}
      />
    </div>
  );
}
