"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ComicCover } from "@/components/merch/ComicCover";
import { useCart } from "@/components/merch/CartProvider";
import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { comicFormats, comicLabel } from "@/lib/utils/comic-sales";
import type { ComicFormat, ComicIssue } from "@/types/merch";

/**
 * One comic issue. Figma: `Merch Store- Comics Detail.png`.
 *
 * Frame at 1440 - cover 189..598 x 190..751, copy column 719..1252. Title ink
 * 215, meta 285, a rule under it, five description lines from 366, price 583,
 * and the quantity plus ADD TO CART at 640..695.
 *
 * NO COLOUR AND NO SIZE, which is the whole difference from a garment. What a
 * chapter has instead is a format - online or print - each at its own price.
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
  const v = c.volumeEdition;
  const copy = c.issues[issue.copyKey as keyof typeof c.issues];
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const formats = comicFormats(issue);
  const [format, setFormat] = useState<ComicFormat>(formats[0] ?? "physical");

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

          {/* CHAPTER SALES (the team, 2026-10-01): a chapter is bought online,
              in print, or both, each at its own price. The frame draws one price;
              it now shows the chosen format's, with the choice above it. A chapter
              sold in one format only shows that one, already chosen. */}
          <fieldset className="mt-12">
            <legend className="text-menu-fg/70 font-body text-body-sm leading-none">{c.chooseFormat}</legend>
            <div className="mt-3.5 flex flex-col gap-3 sm:flex-row">
              {formats.map((f) => (
                <label
                  key={f}
                  className={`flex flex-1 cursor-pointer items-start gap-3.5 border px-4.5 py-4 transition-colors duration-150 ease-gate has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-signal ${
                    format === f ? "border-signal" : "border-menu-fg/30 hover:border-menu-fg/60"
                  }`}
                >
                  <input
                    type="radio"
                    name={`format-${issue.slug}`}
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${format === f ? "border-signal" : "border-menu-fg/60"}`}
                  >
                    {format === f ? <span className="bg-signal size-2.5 rounded-full" /> : null}
                  </span>
                  <span>
                    <span className="text-menu-fg font-body text-body block leading-none">
                      {c.formatNames[f]} · {formatPrice(issue.formats[f] ?? 0, locale, t.price)}
                    </span>
                    <span className="text-menu-fg/70 font-body text-body-sm mt-2 block leading-snug">{c.formatNotes[f]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="font-display text-gild mt-10 text-[2.0625rem] leading-none font-semibold tracking-[-0.04em]">
            {formatPrice(issue.formats[format] ?? 0, locale, t.price)}
          </p>

          <div className="mt-7.5 flex flex-wrap items-stretch gap-6.25">
            {/* One copy of an online chapter is all anyone needs - it unlocks in
                the reader - so only print has a quantity. */}
            {format === "physical" ? (
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
            ) : null}

            {/* A comic has no colourway or size; its line carries the format in
                `colourId` (see `lineFormat`), so the online and printed copies of
                a chapter are separate lines. */}
            <button
              type="button"
              onClick={() =>
                add({ slug: issue.slug, colourId: format, size: "M", quantity: format === "online" ? 1 : quantity })
              }
              className="bg-signal text-menu-fg font-display focus-visible:outline-signal h-13.75 flex-1 cursor-pointer text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase transition-opacity duration-150 ease-gate hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 lg:min-w-79.75"
            >
              {t.detail.addToCart}
            </button>
          </div>

          {/* THE PRINTED VOLUME, when its volume is complete and on sale in print
              (the team's rules, 2026-10-01). Online there is no such thing: a
              volume is read chapter by chapter. No frame draws this; FLAGGED. */}
          {issue.edition ? (
            <section id="volume" aria-labelledby="volume-title" className="border-menu-fg/30 mt-10 scroll-mt-32 border px-5.5 py-5">
              <h2 id="volume-title" className="font-display text-menu-fg text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase">
                {v.title}
              </h2>
              <p className="text-menu-fg/70 font-body text-body-sm mt-2.5 leading-snug">
                {v.body.replace("{volume}", String(issue.volume))}
              </p>
              <div className="mt-4.5 flex flex-wrap items-center justify-between gap-4">
                <p className="font-display text-gild text-[1.625rem] leading-none font-semibold tracking-[-0.04em]">
                  {formatPrice(issue.edition.price, locale, t.price)}
                </p>
                {/* Keyed on the volume's first chapter, so the same volume added from any of its chapters is one line. */}
                <button
                  type="button"
                  disabled={issue.edition.stock === 0}
                  onClick={() => add({ slug: issue.edition!.leadSlug, colourId: "volume", size: "M", quantity: 1 })}
                  className="border-menu-fg/80 text-menu-fg font-display focus-visible:outline-signal hover:bg-menu-fg/10 h-11.5 cursor-pointer border px-5 text-[1.0625rem] leading-none font-semibold tracking-[0.01em] uppercase transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {issue.edition.stock === 0 ? v.soldOut : v.add}
                </button>
              </div>
            </section>
          ) : null}
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
                      {comicLabel(item, messages)}
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
