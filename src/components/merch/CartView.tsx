"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/merch/CartProvider";
import { BracketButton } from "@/components/ui/BracketButton";
import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { entryTotal, resolveCartLines, type CartEntry } from "@/lib/utils/cart-entry";
import type { ComicIssue, Product } from "@/types/merch";

export function CartView({
  products,
  comics,
  messages,
  locale,
}: {
  products: readonly Product[];
  comics: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
}) {
  const { lines, count } = useCart();
  const t = messages.merch;


  // Products AND comics. Searching the product list alone dropped every comic
  // line while still counting it in the badge - see `resolveCartLines`.
  const resolved = resolveCartLines({ lines, products, comics, messages, locale });

  if (count === 0 || resolved.length === 0) {
    return <EmptyCart messages={messages} locale={locale} />;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[62%_34.3%] lg:justify-between lg:gap-0">
      <div>
        <h1 className="font-display text-menu-fg text-h2 leading-none font-semibold tracking-[-0.075em] uppercase">
          {t.cart.title}
        </h1>

        <ul className="mt-8.5">
          {resolved.map((entry) => (
            <CartRow
              key={`${entry.line.slug}-${entry.line.colourId}-${entry.line.size}`}
              entry={entry}
              products={products}
              messages={messages}
              locale={locale}
            />
          ))}
        </ul>
      </div>

      <OrderSummary lines={resolved} messages={messages} locale={locale} />
    </div>
  );
}

function CartRow({
  entry,
  products,
  messages,
  locale,
}: {
  entry: CartEntry;
  products: readonly Product[];
  messages: Messages;
  locale: Locale;
}) {
  const { setQuantity, remove } = useCart();
  const t = messages.merch;
  const { line } = entry;
  const product = products.find((p) => p.slug === line.slug);
  const colour = product?.colours.find((c) => c.id === line.colourId);

  return (
    <li className="border-ash flex gap-6.25 border-b pt-6 pb-2.5 first:pt-0">
      <div className={`relative size-30 shrink-0 ${entry.tileClass}`}>
        <Image
          src={entry.image}
          alt={entry.name}
          fill
          sizes="120px"
          className="object-contain"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col pt-2">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-menu-fg text-[2.0625rem] leading-none font-semibold tracking-[-0.065em] uppercase">
            {entry.name}
          </h2>

          <button
            type="button"
            onClick={() => remove(line.slug, line.colourId, line.size)}
            aria-label={t.cart.remove.replace("{item}", entry.name)}
            className="text-signal focus-visible:outline-signal cursor-pointer transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <TrashGlyph />
          </button>
        </div>

        {/* A comic has no colourway and no size, so neither row is drawn. */}
        {entry.variant ? (
          <>
            <p className="text-menu-fg font-body text-body mt-0.5 leading-none">
              <span className="font-bold">{t.cart.colour}</span>{" "}
              {colour ? t.colours[colour.labelKey] : line.colourId}
            </p>
            <p className="text-menu-fg font-body text-body mt-2 leading-none">
              <span className="font-bold">{t.cart.size}</span> {t.sizes[line.size]}
            </p>
          </>
        ) : null}

        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="font-display text-menu-fg text-[2.0625rem] leading-none font-semibold tracking-[-0.065em]">
            {formatPrice(entry.price, locale, t.price)}
          </p>

          <div className="border-menu-fg/30 flex h-9.25 w-26.5 shrink-0 items-center justify-between border px-3.5">
            <Step
              label={messages.merch.detail.decrease}
              onClick={() =>
                setQuantity(
                  line.slug,
                  line.colourId,
                  line.size,
                  line.quantity - 1,
                )
              }
              glyph="−"
            />
            <span className="text-menu-fg font-body text-body-sm">
              {line.quantity}
            </span>
            <Step
              label={messages.merch.detail.increase}
              onClick={() =>
                setQuantity(
                  line.slug,
                  line.colourId,
                  line.size,
                  line.quantity + 1,
                )
              }
              glyph="+"
            />
          </div>
        </div>
      </div>
    </li>
  );
}

function OrderSummary({
  lines,
  messages,
  locale,
}: {
  lines: readonly CartEntry[];
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.merch;
  const s = t.summary;

  const itemTotal = lines.reduce((sum, entry) => sum + entryTotal(entry), 0);

  const pointDiscount = 0;
  const total = itemTotal - pointDiscount;

  return (
    <aside className="bg-gild text-ink px-6 pt-7.25 pb-5.75 lg:mt-16.75">
      <h2 className="font-display text-[2.0625rem] leading-none font-semibold tracking-[-0.04em] uppercase">
        {s.title}
      </h2>

      <dl className="mt-9.25">
        <Row
          label={s.itemTotal}
          value={formatPrice(itemTotal, locale, t.price)}
        />
        <Row
          label={s.pointDiscount}
          value={`−${formatPrice(pointDiscount, locale, t.price)}.00`}
          bold
          className="mt-6.25"
        />
        <Row
          label=""
          value={formatPrice(total, locale, t.price)}
          className="mt-6.25"
        />
      </dl>

      <hr className="border-ink/25 mt-10" />

      <dl className="mt-4.5">
        <Row
          label={s.shipping}
          value={s.free}
          valueClass="text-moss font-semibold"
        />
        <Row
          label={s.total}
          value={formatPrice(total, locale, t.price)}
          className="mt-6"
          valueClass="font-display text-[2.0625rem] leading-none font-semibold tracking-[-0.04em]"
        />
      </dl>

      <Link
        href={`/${locale}/merch/checkout`}
        className="bg-ink text-menu-fg font-body focus-visible:outline-signal mt-8.25 flex h-13.75 items-center justify-center gap-3 text-h7 leading-none transition-opacity duration-150 ease-gate hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {s.checkout}
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="h-5 w-5 flex-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 4l6 6-6 6" />
        </svg>
      </Link>
    </aside>
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
      <dt
        className={`font-body text-body leading-none ${bold ? "font-bold" : ""}`}
      >
        {label}
      </dt>
      <dd className={`font-body text-body leading-none ${valueClass}`}>
        {value}
      </dd>
    </div>
  );
}

function EmptyCart({
  messages,
  locale,
}: {
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.merch.cart.empty;

  return (
    <div className="flex flex-col items-center pt-14 text-center md:pt-29.5">
      <Image
        src="/assets/merch/cart-m.svg"
        alt=""
        aria-hidden
        width={300}
        height={300}
        className="w-52 select-none md:w-75"
      />

      <h1 className="font-display text-menu-fg mt-10.75 text-[2.25rem] leading-none font-semibold tracking-tighter uppercase">
        {t.title}
      </h1>
      <p className="text-menu-fg font-body text-body mt-0.75 leading-none">
        {t.subtitle}
      </p>

      <div className="mt-11.75">
        <BracketButton
          href={`/${locale}/merch`}
          className="px-3.75 py-[1.15rem] tracking-normal"
        >
          {t.cta}
        </BracketButton>
      </div>
    </div>
  );
}

function Step({
  label,
  onClick,
  glyph,
}: {
  label: string;
  onClick: () => void;
  glyph: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-gild font-body focus-visible:outline-signal cursor-pointer text-h7 leading-none focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {glyph}
    </button>
  );
}

/** The bin. Drawn - no icon was delivered, and ornaments here are SVG. */
function TrashGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 22"
      className="h-5.5 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M1 4.5h14" />
      <path d="M6 4.5V2h4v2.5" />
      <path d="M2.5 4.5l1 16h9l1-16" />
      <path d="M6.5 8.5v8M9.5 8.5v8" />
    </svg>
  );
}
