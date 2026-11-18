"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/merch/CartProvider";
import { SupportNote } from "@/components/ui/SupportNote";
import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { entryTotal, resolveCartLines } from "@/lib/utils/cart-entry";
import { colourLabel, sizeLabel } from "@/lib/utils/merch-copy";
import { isRemoteImage } from "@/lib/utils/remote-image";
import { promoLive, shipsFree, type FreeShippingPromo } from "@/lib/api/shipping";
import type { ComicIssue, Product } from "@/types/merch";
import type { RewardCode } from "@/types/seeds";

/**
 * The checkout's right column: what is being bought, then what it costs.
 *
 * Frame at 1440 - summary panel 904..1347 x 137..560, totals 904..1347 x
 * 592..1075.
 *
 * PLACE ORDER IS THE ONLY WAY TO PAY, and on the live site it opens Paystack,
 * which offers card, bank transfer and USSD. In this build it takes no payment:
 * there is no backend, no Paystack key and no card detail anywhere, so it
 * advances straight to the designed confirmation. Recorded here so nobody has
 * to read the handler to find out.
 */
export function CheckoutSummary({
  products,
  comics,
  messages,
  locale,
  rate,
  promo,
  freeShipping,
  shipping: ships = true,
  placeError,
  codes = [],
  codeId = null,
  onCodeChange,
  discount = null,
  codeHint = false,
  busy = false,
  onPlaceOrder,
}: {
  products: readonly Product[];
  comics: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
  /** What delivery costs for the chosen method and place; null until a place is chosen. */
  rate: number | null;
  /** The free shipping promotion: an order reaching its minimum ships free. */
  promo: FreeShippingPromo;
  /** The API's own word on whether this order ships free (its quote). */
  freeShipping?: boolean;
  /** False when nothing in the cart ships: no shipping line, and nothing added for it. */
  shipping?: boolean;
  /** Why PLACE ORDER can't go on yet, e.g. no place chosen. */
  placeError?: string | null;
  /** The player's Seeds codes still to use, offered above the discount line. */
  codes?: readonly RewardCode[];
  /** The one chosen; null for none. */
  codeId?: string | null;
  onCodeChange?: (id: string | null) => void;
  /** The chosen code's percent off the items, and the most it takes off (null: no cap known). */
  discount?: { pct: number; cap: number | null } | null;
  /** No code, but Seeds enough for one: a line pointing to the store's rewards. */
  codeHint?: boolean;
  /** The order is on its way to the API: PLACE ORDER waits. */
  busy?: boolean;
  onPlaceOrder: () => void;
}) {
  const { lines } = useCart();
  const t = messages.merch;
  const c = t.checkout;

  const resolved = resolveCartLines({ lines, products, comics, messages, locale });
  const itemTotal = resolved.reduce((sum, entry) => sum + entryTotal(entry), 0);
  // The chosen Seeds code's share of the items, in whole naira, up to its reward's cap.
  // Items only, never shipping (the backend, 2026-11-16); the order it places carries the total paid.
  const pointDiscount = discount ? Math.min(Math.floor((itemTotal * discount.pct) / 100), discount.cap ?? Infinity) : 0;
  const subtotal = itemTotal - pointDiscount;
  // Free under a running promotion whose minimum the items reach (2026-10-01);
  // otherwise the place's price, unknown until a place is chosen.
  const free = ships && (freeShipping ?? shipsFree(promo, itemTotal));
  const shipping = !ships || free ? 0 : rate;
  const gap = ships && !free && promoLive(promo) ? promo.minimumOrder - itemTotal : 0;
  const total = subtotal + (shipping ?? 0);

  return (
    <div>
      <section className="border-menu-fg/33 border px-6.5 pt-7.25 pb-4.5">
        <h2 className="font-display text-menu-fg text-[2.0625rem] leading-none font-semibold tracking-[-0.04em] uppercase">
          {c.orderSummary}
        </h2>

        <ul className="mt-6.75">
          {resolved.map((entry) => {
            const { line } = entry;
            const product = products.find((p) => p.slug === line.slug);
            const colour = product?.colours.find((col) => col.id === line.colourId);
            return (
              <li
                key={`${line.slug}-${line.colourId}-${line.size}`}
                className="border-menu-fg/20 flex items-start gap-5 border-b py-3.5 last:border-b-0"
              >
                <div className={`relative size-19 shrink-0 ${entry.tileClass}`}>
                  <Image src={entry.image} unoptimized={isRemoteImage(entry.image)} alt={entry.name} fill sizes="76px" className="object-contain" />
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-menu-fg text-[1.375rem] leading-none font-semibold tracking-[-0.03em] uppercase">
                      {entry.name}
                    </h3>
                    {/* A comic has no colourway or size; it names its format instead. */}
                    {entry.formatLabel ? (
                      <p className="text-menu-fg/85 font-body text-body-sm mt-2.5 leading-none">{entry.formatLabel}</p>
                    ) : null}
                    {/* Colour | size, each only where the product has one. */}
                    {entry.variant && (line.colourId || line.size) ? (
                      <p className="text-menu-fg/85 font-body text-body-sm mt-2.5 leading-none">
                        {line.colourId ? (colour ? colourLabel(colour, messages) : line.colourId) : null}
                        {line.colourId && line.size ? <span className="text-menu-fg mx-1.5 font-bold">|</span> : null}
                        {line.size ? sizeLabel(line.size, messages) : null}
                      </p>
                    ) : null}
                  </div>

                  <p className="font-display text-menu-fg shrink-0 text-[1.125rem] leading-none font-semibold">
                    {formatPrice(entry.price, locale, t.price)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-gild text-ink mt-8 px-6.5 pt-6 pb-5.75">
        <Row label={c.itemTotal} value={formatPrice(itemTotal, locale, t.price)} />

        {/* The player's Seeds codes, as a choice; the discount line under it follows. */}
        {codes.length > 0 ? (
          <fieldset className="mt-6.25">
            <legend className="font-body text-body leading-none font-bold">{c.codeTitle}</legend>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <CodeChip name="seeds-code" checked={!codeId} onChange={() => onCodeChange?.(null)}>
                {c.codeNone}
              </CodeChip>
              {codes.map((code) => (
                <CodeChip key={code.id} name="seeds-code" checked={codeId === code.id} onChange={() => onCodeChange?.(code.id)}>
                  {c.codeOption.replace("{pct}", String(code.discountPct))}
                  <span className="font-display ml-2 text-[1.0625rem] leading-none tracking-[0.04em] uppercase">{code.code}</span>
                </CodeChip>
              ))}
            </div>
          </fieldset>
        ) : codeHint ? (
          <p className="font-body text-body-sm mt-6.25 leading-snug">
            {c.codeHint}{" "}
            <Link
              href={`/${locale}/merch`}
              className="focus-visible:outline-signal font-semibold underline underline-offset-4 transition-opacity duration-150 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {c.codeHintLink}
            </Link>
          </p>
        ) : null}

        <Row
          label={c.pointDiscount}
          value={`−${formatPrice(pointDiscount, locale, t.price)}.00`}
          bold
          className="mt-6.25"
        />
        <Row label="" value={formatPrice(subtotal, locale, t.price)} className="mt-6.25" />

        <hr className="border-ink/25 mt-9" />

        {/* Priced by method, state and local government. Not drawn when nothing ships. */}
        {ships ? (
        <Row
          label={c.shippingRow}
          value={free ? c.free : shipping === null ? c.shippingPending : formatPrice(shipping, locale, t.price)}
          valueClass={free ? "text-moss font-semibold" : shipping === null ? "text-ink/60" : ""}
          className="mt-5.5"
        />
        ) : null}
        {gap > 0 ? (
          <p className="font-body text-body-sm mt-2.5 leading-snug">
            {t.summary.freeShippingGap.replace("{amount}", formatPrice(gap, locale, t.price))}
          </p>
        ) : null}
        <Row
          label={c.total}
          value={formatPrice(total, locale, t.price)}
          className="mt-6"
          valueClass="font-display text-[2.0625rem] leading-none font-semibold tracking-[-0.04em]"
        />

        {/* FLAGGED, and raised with the human: this promises encryption of
            payment information. Nothing is encrypted because nothing is sent and
            no payment is taken. Drawn in the frame; shipped as drawn pending a
            decision, but it cannot go live as-is. */}
        <div className="border-ink/25 mt-9 border px-4.5 py-4">
          <p className="font-body text-body leading-none font-semibold">{c.secureTitle}</p>
          <p className="font-body text-body-sm mt-2.5 leading-none">{c.secureBody}</p>
        </div>

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={busy}
          aria-busy={busy || undefined}
          className="bg-ink text-menu-fg font-body focus-visible:outline-signal mt-9 flex h-13.75 w-full cursor-pointer disabled:cursor-wait disabled:opacity-60 items-center justify-center gap-3 text-[1.125rem] leading-none transition-opacity duration-150 ease-gate hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {c.placeOrder}
          <span aria-hidden>›</span>
        </button>
        {placeError ? (
          <p role="alert" className="text-signal font-body text-body-sm mt-3 leading-snug">
            {placeError}
          </p>
        ) : null}
        {/* One button: Paystack's own window offers every way to pay. */}
        <p className="font-body text-body-sm mt-3 leading-snug">{c.payWith}</p>
      </section>

      <SupportNote messages={messages} layout="stacked" className="mt-9" />
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
  className = "",
  valueClass = "",
}: {
  label: string;
  value: string;
  bold?: boolean;
  className?: string;
  valueClass?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${className}`}>
      <span className={`font-body text-body leading-none ${bold ? "font-bold" : ""}`}>{label}</span>
      <span className={`font-body text-body leading-none ${valueClass}`}>{value}</span>
    </div>
  );
}

/** One choice of Seeds code: a square chip on the gold, black once chosen. */
function CodeChip({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`font-body text-body-sm has-focus-visible:outline-signal flex cursor-pointer items-center border px-3.5 py-2.5 leading-none transition-colors duration-150 ease-gate has-focus-visible:outline-2 has-focus-visible:outline-offset-2 ${
        checked ? "bg-ink text-gild border-ink" : "border-ink/40 hover:border-ink"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}
