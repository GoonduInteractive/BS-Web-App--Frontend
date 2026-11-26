"use client";

import Image from "next/image";

import { useCart } from "@/components/merch/CartProvider";
import { CALABASH_ID } from "@/components/calabash/id";
import { SeedsFlag } from "@/components/hedera/SeedsFlag";
import { nextRewardAt } from "@/components/merch/PointsPanel";
import { hbarDiscountOff } from "@/hooks/useHbarDiscount";
import { SupportNote } from "@/components/ui/SupportNote";
import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { entryTotal, resolveCartLines } from "@/lib/utils/cart-entry";
import { colourLabel, sizeLabel } from "@/lib/utils/merch-copy";
import { isRemoteImage } from "@/lib/utils/remote-image";
import { promoLive, shipsFree, type FreeShippingPromo } from "@/lib/api/shipping";
import type { ComicIssue, Product } from "@/types/merch";
import type { RewardCode, RewardTier, SeedsBalance } from "@/types/seeds";

const count = (n: number) => new Intl.NumberFormat("en-NG").format(n);

/** Paystack, or HBAR from the player's Hedera wallet (only offered while the Hedera section is on). */
export type PayWith = "paystack" | "hbar";

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
  seeds = null,
  tiers = [],
  onRedeem,
  busy = false,
  payWith,
  onPayWithChange,
  hbarDiscountPct = 0,
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
  /** The signed-in player's Seeds; null signed out or still loading (no YOUR SEEDS box). */
  seeds?: SeedsBalance | null;
  /** The rewards, cheapest first: the ones the Seeds reach get a REDEEM here. */
  tiers?: readonly RewardTier[];
  onRedeem?: (tier: RewardTier) => void;
  /** The order is on its way to the API: PLACE ORDER waits. */
  busy?: boolean;
  /** How it's paid, when there's a choice: HBAR beside Paystack while the Hedera section is on. */
  payWith?: PayWith;
  onPayWithChange?: (payWith: PayWith) => void;
  /** Percent off the whole order when it's paid in HBAR (the admin's Treasury setting); 0 for none. */
  hbarDiscountPct?: number;
  onPlaceOrder: () => void;
}) {
  const { lines } = useCart();
  const t = messages.merch;
  const c = t.checkout;
  const p = t.points;
  const reachable = seeds ? tiers.filter((tier) => tier.cost <= seeds.calabash) : [];
  const nextAt = seeds ? nextRewardAt(tiers, seeds.calabash) : undefined;
  // The codes to use, as a choice; the discount line under it follows.
  // A wrapper carries the spacing and any rule: a fieldset's own top border runs through its legend.
  const codeChoice = (className: string) => (
    <div className={className}>
    <fieldset>
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
    </div>
  );

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
  // Paid in HBAR, a little off the whole order (the team, 2026-11-23: ₦20,000 by card, ₦19,500 in HBAR).
  const hbarOff = payWith === "hbar" ? hbarDiscountOff(total, hbarDiscountPct) : 0;
  const pct = String(hbarDiscountPct);

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

        {/* YOUR SEEDS, compact, inside the summary (the human, 2026-11-23: the full card under it
            left a tall empty column). The balance; a REDEEM for each reward it reaches, so a code
            can be made and used on this order; otherwise how far the next one is, and the way to
            the Calabash, where the full rewards and codes live. The codes to use are under it. */}
        {seeds ? (
          <div className="border-ink/25 mt-6.25 border px-4.5 pt-4 pb-4.5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="font-body text-body leading-none font-bold">{c.seedsTitle}</p>
                {payWith ? <SeedsFlag messages={messages} tone="ink" /> : null}
              </div>
              <p className="font-display text-[1.625rem] leading-none font-semibold tracking-[-0.02em]">
                {count(seeds.calabash)} <span className="text-[1.0625rem]">{p.unit}</span>
              </p>
            </div>
            {reachable.length ? (
              <ul className="mt-4 flex flex-col gap-2.5">
                {reachable.map((tier) => (
                  <li key={`${tier.discountPct}-${tier.cost}`} className="flex items-center justify-between gap-3">
                    <span className="font-body text-body-sm leading-snug">
                      {tier.name} <span className="text-ink/60">· {p.cost.replace("{count}", count(tier.cost))}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRedeem?.(tier)}
                      aria-label={p.redeemLabel.replace("{reward}", tier.name).replace("{count}", count(tier.cost))}
                      className="border-ink font-body hover:bg-ink hover:text-gild focus-visible:outline-signal h-8 shrink-0 cursor-pointer border px-3 text-[0.8125rem] leading-none font-semibold tracking-wider transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {p.redeem}
                    </button>
                  </li>
                ))}
              </ul>
            ) : nextAt != null ? (
              <p className="font-body text-body-sm mt-3 leading-snug">
                {p.next.replace("{count}", count(nextAt - seeds.calabash))}.{" "}
                <a
                  href={`/${locale}/profile#${CALABASH_ID}`}
                  className="focus-visible:outline-signal font-semibold underline underline-offset-4 transition-opacity duration-150 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {c.seedsCalabash}
                </a>
              </p>
            ) : null}
            {codes.length > 0 ? codeChoice("border-ink/20 mt-4.5 border-t pt-4") : null}
          </div>
        ) : codes.length > 0 ? (
          codeChoice("mt-6.25")
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
        {hbarOff > 0 ? (
          <Row
            label={messages.hedera.payWith.discountRow.replace("{pct}", pct)}
            value={`−${formatPrice(hbarOff, locale, t.price)}`}
            bold
            className="mt-5.5"
          />
        ) : null}
        <Row
          label={c.total}
          value={formatPrice(total - hbarOff, locale, t.price)}
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

        {/* HBAR beside Paystack (the Hedera doc's changed screens). No frame draws the
            choice: the secure box's own rule and type, with a native radio. */}
        {payWith && onPayWithChange ? (
          <fieldset className="mt-9">
            <legend className="font-body text-body leading-none font-semibold">{messages.hedera.payWith.title}</legend>
            <div className="mt-4 flex flex-col gap-3">
              {(["paystack", "hbar"] as const).map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer gap-3.5 border px-4.5 py-4 ${payWith === option ? "border-ink" : "border-ink/25"}`}
                >
                  <input
                    type="radio"
                    name="pay-with"
                    value={option}
                    checked={payWith === option}
                    onChange={() => onPayWithChange(option)}
                    className="accent-ink mt-0.5 size-4 shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-body text-body flex flex-wrap items-center gap-2.5 leading-none font-semibold">
                      {option === "paystack" ? messages.hedera.payWith.paystack : messages.hedera.payWith.hbar}
                      {/* Hedera's mark beside HBAR (the team, 2026-11-23). The delivered logo is white, so it sits on ink. */}
                      {option === "hbar" ? (
                        <span className="bg-ink inline-flex h-6 items-center rounded-sm px-2">
                          <Image src="/assets/partners/hedera-logo.webp" alt={messages.hedera.payWith.logoAlt} width={214} height={60} className="h-3.5 w-auto select-none" />
                        </span>
                      ) : null}
                    </span>
                    <span className="font-body text-body-sm mt-2 block leading-snug">
                      {option === "paystack" ? messages.hedera.payWith.paystackNote : messages.hedera.payWith.hbarNote}
                    </span>
                    {option === "hbar" && hbarDiscountPct > 0 ? (
                      <span className="font-body text-body-sm mt-1.5 block leading-snug font-semibold">
                        {messages.hedera.payWith.discount.replace("{pct}", pct)}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

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
        {payWith !== "hbar" ? <p className="font-body text-body-sm mt-3 leading-snug">{c.payWith}</p> : null}
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
