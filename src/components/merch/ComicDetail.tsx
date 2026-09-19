"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ComicCover } from "@/components/merch/ComicCover";
import { useCart } from "@/components/merch/CartProvider";
import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue } from "@/types/merch";

/**
 * One comic issue. Figma: `Merch Store- Comics Detail.png`.
 *
 * Frame at 1440 — cover 189..598 x 190..751, copy column 719..1252. Title ink
 * 215, meta 285, a rule under it, five description lines from 366, price 583,
 * and the quantity plus ADD TO CART at 640..695.
 *
 * NO COLOUR AND NO SIZE, which is the whole difference from a garment: an issue
 * is one thing, so the controls are a quantity and a button.
 */
export function ComicDetail({
  issue,
  related,
  messages,
  locale,
}: {
  issue: ComicIssue;
  related: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.merch;
  const c = t.comics;
  const copy = c.issues[issue.copyKey as keyof typeof c.issues];
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[38.6%_50.1%] lg:justify-between lg:gap-0 lg:px-[8.5%]">
        <div>
          <ComicCover issue={issue} messages={messages} priority size="cover" />
        </div>

        <div className="lg:pt-4.25">
          <h1 className="font-display text-menu-fg text-[4.3125rem] leading-none font-semibold tracking-tighter uppercase">
            {copy.title}
          </h1>

          <p className="text-menu-fg font-body text-body leading-none">
            {copy.meta}
          </p>

          {/* The frame's rule carries a serif at each end, which is the same
              footer stroke the site already uses. */}
          {/* Stretched rather than fitted: the artwork carries no
              preserveAspectRatio, the same reason SiteFooter uses object-fill on
              this stroke. */}
          <Image
            src="/assets/ornaments/Arrow-border-footer.svg"
            alt=""
            aria-hidden
            width={1282}
            height={11}
            className="mt-5.5 block h-[0.6875rem] w-full object-fill select-none"
          />

          {copy.description ? (
            <p className="text-menu-fg font-body text-body mt-10.25 max-w-[20rem] leading-6.25">
              {copy.description}
            </p>
          ) : null}

          <p className="font-display text-gild mt-23.25 text-[2.0625rem] leading-none font-semibold tracking-[-0.04em]">
            {formatPrice(issue.price, locale, t.price)}
          </p>

          <div className="mt-7.5 flex flex-wrap items-stretch gap-6.25">
            <div className="border-menu-fg/30 flex h-13.75 w-40 items-center justify-between border px-5">
              <Step
                label={t.detail.decrease}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                glyph="−"
              />
              <span className="text-menu-fg font-body text-body">
                {quantity}
              </span>
              <Step
                label={t.detail.increase}
                onClick={() => setQuantity((q) => q + 1)}
                glyph="+"
              />
            </div>

            {/* A comic has no colourway and no size, so the cart line carries the
                issue's slug with both fields fixed. The cart still merges and
                counts it like anything else. */}
            <button
              type="button"
              onClick={() =>
                add({ slug: issue.slug, colourId: "-", size: "M", quantity })
              }
              className="bg-signal text-menu-fg font-display focus-visible:outline-signal h-13.75 flex-1 cursor-pointer text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase transition-opacity duration-150 ease-gate hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 lg:min-w-79.75"
            >
              {t.detail.addToCart}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="pt-20 md:pt-26">
          <h2 className="font-display text-menu-fg text-h2 leading-none font-semibold tracking-[-0.075em] uppercase">
            {c.related}
          </h2>

          <ul className="mt-9 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:mt-5.25 lg:grid-cols-4">
            {related.map((item, i) => {
              const itemCopy = c.issues[item.copyKey as keyof typeof c.issues];
              return (
                <li key={`${item.slug}-${i}`}>
                  <Link
                    href={`/${locale}/merch/comics/${item.slug}`}
                    className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    <ComicCover issue={item} messages={messages} />
                    <h3 className="font-display text-menu-fg mt-5 text-[1.375rem] leading-none font-semibold tracking-[-0.03em] uppercase">
                      {itemCopy.title}
                    </h3>
                    <p className="text-menu-fg/85 font-body text-body-sm mt-2.5 leading-none">
                      {itemCopy.format}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function Step({
  label,
  onClick,
  glyph,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  glyph: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`font-body focus-visible:outline-signal cursor-pointer text-[1.375rem] leading-none focus-visible:outline-2 focus-visible:outline-offset-2 ${
        disabled ? "text-menu-fg/27 cursor-not-allowed" : "text-gild"
      }`}
    >
      {glyph}
    </button>
  );
}
