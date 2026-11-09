import { z } from "zod";

import { ApiError, apiGet, fromMinor } from "./client";
import { startPayment } from "./payments";
import { authedRequest } from "./session";
import type { DeliveryMethod } from "./shipping";

const toMinor = (naira: number) => Math.round(naira * 100);

/**
 * The store, as the signed-in player, in the browser: their cart
 * (`/v1/cart`, `/v1/cart/items`), their saved delivery details
 * (`/v1/shipping/info`), the shipping fee for a place (`/v1/shipping/quote`,
 * which anyone may ask), placing an order from the cart with where it goes
 * (`/v1/orders/checkout`), paying for it (`/v1/payments/init`) and reading it
 * back (`/v1/orders/{id}/summary`). The catalogue itself is read on the server
 * (`lib/api/merch.ts`).
 *
 * PLACES ARE NAMED TWO WAYS: the quote takes slugs ("lagos", "ibeju-lekki"),
 * the order and the saved details take names ("Lagos", "Ibeju-Lekki"). The
 * site's places are `nigeria-lga-data`'s names, slugged here the way the
 * backend slugs them (probed 2026-10-27: "abia" quotes, "Abia" doesn't).
 */

/** "Ibeju-Lekki" -> "ibeju-lekki", "Akwa Ibom" -> "akwa-ibom". */
export const placeSlug = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** The checkout form's two ways to receive an order, as the API names them. */
const API_METHOD: Record<DeliveryMethod, "delivery" | "pickup"> = { homeDelivery: "delivery", pickup: "pickup" };
const fromApiMethod = (m: string): DeliveryMethod => (m === "pickup" ? "pickup" : "homeDelivery");

/** Where an order goes, by name, as the checkout form holds it. */
export type ShippingDetails = {
  method: DeliveryMethod;
  firstName: string;
  lastName: string;
  /** As typed after the form's +234: "801 234 5678". */
  phone: string;
  address: string;
  city: string;
  zip: string;
  /** The state's name, e.g. "Lagos". */
  state: string;
  /** The local government's name, e.g. "Ikeja". */
  lga: string;
};

/** "801 234 5678" or "0801…" -> "+2348012345678"; a number already in full is kept. */
function fullPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return `+${trimmed.replace(/\D/g, "")}`;
  return `+234${trimmed.replace(/\D/g, "").replace(/^0/, "")}`;
}

function toApiShipping(d: ShippingDetails) {
  const home = d.method === "homeDelivery";
  return {
    first_name: d.firstName.trim(),
    last_name: d.lastName.trim(),
    phone: fullPhone(d.phone),
    state: d.state,
    lga: d.lga,
    delivery_method: API_METHOD[d.method],
    // Pickup goes to a collection centre in the local government: no home address is asked for.
    ...(home && d.address.trim() && { address: d.address.trim() }),
    ...(home && d.city.trim() && { city: d.city.trim() }),
    ...(home && d.zip.trim() && { zipcode: d.zip.trim() }),
    country: "Nigeria",
  };
}

const apiShippingInfo = z.object({
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  phone: z.string().nullish(),
  state: z.string().nullish(),
  lga: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  zipcode: z.string().nullish(),
  delivery_method: z.string().nullish(),
});

/** The player's saved delivery details, or null before their first order. */
export async function getShippingInfo(): Promise<ShippingDetails | null> {
  let info: z.output<typeof apiShippingInfo> | null;
  try {
    info = await authedRequest("GET", "/v1/shipping/info", apiShippingInfo.nullable());
  } catch (e) {
    // None saved yet can be a 404; that is no details, not a failure.
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
  if (!info) return null;
  return {
    method: fromApiMethod(info.delivery_method ?? ""),
    firstName: info.first_name ?? "",
    lastName: info.last_name ?? "",
    // The form adds +234 itself.
    phone: (info.phone ?? "").replace(/^\+234/, ""),
    address: info.address ?? "",
    city: info.city ?? "",
    zip: info.zipcode ?? "",
    state: info.state ?? "",
    lga: info.lga ?? "",
  };
}

export type ShippingQuote = {
  /** Naira; 0 when it ships free. */
  fee: number;
  free: boolean;
  /** The order total that ships free while a promotion runs, in naira; null when none runs. */
  freeFrom: number | null;
};

/**
 * What shipping costs to a place, for an order of `itemTotal` naira. A 404 is
 * a place the admin hasn't priced ("No shipping rate for this state").
 * FLAGGED: Abia quoted `fee_minor: 8000` (₦80) on 2026-10-27, while the admin
 * enters prices in naira - if Abia is ₦8,000 in the admin, the quote is in
 * naira despite its name.
 */
export async function getShippingQuote(place: { state: string; lga?: string; method: DeliveryMethod; itemTotal: number }): Promise<ShippingQuote> {
  const query = new URLSearchParams({
    state_slug: placeSlug(place.state),
    delivery_method: API_METHOD[place.method],
    order_total_minor: String(toMinor(place.itemTotal)),
    ...(place.lga && { lga_slug: placeSlug(place.lga) }),
  });
  const q = await apiGet(
    `/v1/shipping/quote?${query}`,
    z.object({ fee_minor: z.coerce.number(), free_shipping: z.boolean().default(false), free_shipping_threshold_minor: z.coerce.number().nullish() }),
  );
  return {
    fee: q.free_shipping ? 0 : fromMinor(q.fee_minor),
    free: q.free_shipping,
    freeFrom: q.free_shipping_threshold_minor != null ? fromMinor(q.free_shipping_threshold_minor) : null,
  };
}

const cartItem = z.object({ variant_id: z.string(), quantity: z.number() });
const cart = z.object({ items: z.array(cartItem).default([]) });

export type ServerCartItem = z.output<typeof cartItem>;

/** The API hasn't that many: "Requested quantity exceeds available stock" (seen 2026-11-06). */
export function isStockRefusal(e: unknown): boolean {
  return e instanceof ApiError && e.status >= 400 && e.status < 500 && /stock/i.test(e.message);
}

export async function getCart(): Promise<readonly ServerCartItem[]> {
  return (await authedRequest("GET", "/v1/cart", cart.nullable()))?.items ?? [];
}

export async function addToCart(variantId: string, quantity: number): Promise<void> {
  await authedRequest("POST", "/v1/cart/items", z.unknown(), { variant_id: variantId, quantity });
}

/** Changes a line by `delta` (+1, -2…): the API's cart takes a change, not a count. */
export async function changeCartItem(variantId: string, delta: number): Promise<void> {
  await authedRequest("PATCH", "/v1/cart/items", z.unknown(), { variant_id: variantId, delta });
}

export async function removeCartItem(variantId: string): Promise<void> {
  await authedRequest("DELETE", "/v1/cart/items", z.unknown(), { variant_id: variantId });
}

const order = z.object({
  id: z.string(),
  order_number: z.string().nullish(),
  total_minor: z.coerce.number(),
  status: z.string(),
  // By variant, not by name: the page names them from the catalogue.
  items: z
    .array(z.object({ variant_id: z.string(), sku: z.string().nullish(), price_minor: z.coerce.number().nullish(), quantity: z.coerce.number().nullish() }))
    .default([]),
});

export type PlacedOrderLine = { variantId: string; sku: string; quantity: number; unitPrice: number };
export type PlacedOrder = { id: string; number: string; total: number; status: string; lines: readonly PlacedOrderLine[] };

const toOrder = (o: z.output<typeof order>): PlacedOrder => ({
  id: o.id,
  number: o.order_number ?? o.id,
  total: fromMinor(o.total_minor),
  status: o.status,
  lines: o.items.map((i) => ({ variantId: i.variant_id, sku: i.sku ?? "", quantity: i.quantity ?? 1, unitPrice: fromMinor(i.price_minor ?? 0) })),
});

/**
 * Whether the order has been paid for. Only the API decides: Paystack tells it
 * by webhook (`/v1/payments/webhook`), and nothing the site does can.
 */
export const isPaid = (o: PlacedOrder) => !["pending_payment", "cancelled"].includes(o.status);

/**
 * Turns the cart into an order, to be paid through Paystack. `shipping` is
 * where it goes - left out for an order of online chapters only. The API also
 * saves it as the player's details for next time.
 */
export async function placeOrder(shipping?: ShippingDetails): Promise<PlacedOrder> {
  return toOrder(
    await authedRequest("POST", "/v1/orders/checkout", order, {
      payment_method: "paystack",
      ...(shipping && { shipping: toApiShipping(shipping) }),
    }),
  );
}

export async function getOrderSummary(id: string): Promise<PlacedOrder> {
  return toOrder(await authedRequest("GET", `/v1/orders/${encodeURIComponent(id)}/summary`, order));
}

/**
 * Starts paying for the order. Returns where to send the player: Paystack's
 * checkout, or straight back for a free order, which the API has already
 * fulfilled (`startPayment`).
 */
export function payForOrder(orderId: string, callbackUrl: string): Promise<string> {
  return startPayment("order", orderId, callbackUrl);
}
