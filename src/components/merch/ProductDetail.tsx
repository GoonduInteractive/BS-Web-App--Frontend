"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { useCart } from "@/components/merch/CartProvider";
import { TornPlate } from "@/components/ui/TornPlate";
import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Product, ProductSize, TileField } from "@/types/merch";

const FIELD: Record<TileField, string> = {
  linen: "bg-linen",
  crimson: "bg-crimson",
  white: "bg-menu-fg",
};


export function ProductDetail({
  product,
  messages,
  locale,
}: {
  product: Product;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.merch;
  const d = t.detail;
  const copy = t.products[product.copyKey];
  const { add } = useCart();

  const sizeGroup = useRef<HTMLDivElement>(null);
  const [colourId, setColourId] = useState(product.colours[0].id);
  const [size, setSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[49.1%_39.5%] lg:gap-[2.4%]">
      {/* ---- Plate ---- */}
      <div className={`relative aspect-628/574 w-full overflow-hidden ${FIELD[product.tile]}`}>
        {product.exclusive ? (
          <span className="text-menu-fg font-body absolute top-5 left-5 z-10 inline-grid h-8.25 w-23 place-items-center text-[0.8125rem] font-semibold tracking-[0.02em] select-none">
            <TornPlate className="text-ink" />
            {t.featured.exclusive}
          </span>
        ) : null}

        <Image
          src={product.image}
          alt={copy.imageAlt}
          fill
          priority
          sizes="(max-width: 1023px) 92vw, 50vw"
          className="object-contain"
        />
      </div>

      {/* ---- Options ---- */}
      <div className="lg:pt-1.25">
        <h1 className="font-display text-menu-fg text-h2 leading-none font-semibold tracking-[-0.075em] uppercase">
          {copy.name}
        </h1>
        <p className="font-display text-menu-fg mt-1.75 text-[2.0625rem] leading-none font-semibold tracking-[-0.065em]">
          {formatPrice(product.price, locale, t.price)}
        </p>

        {/* ---- Colour ---- */}
        <p id="colour-label" className="font-display text-menu-fg text-h7 mt-7.25 leading-none font-bold tracking-[0.02em] uppercase">
          {d.selectColour}
        </p>
        <div role="radiogroup" aria-labelledby="colour-label" className="mt-1.75 flex gap-2">
          {product.colours.map((colour) => {
            const selected = colour.id === colourId;
            return (
              <button
                key={colour.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={t.colours[colour.labelKey]}
                onClick={() => setColourId(colour.id)}

                className={`size-6.5 cursor-pointer outline-offset-0 ${colour.swatch} ${
                  selected ? "outline-signal outline-2" : ""
                } focus-visible:outline-signal focus-visible:outline-2 focus-visible:outline-offset-2`}
              />
            );
          })}
        </div>

        {/* ---- Size ---- */}
        <p id="size-label" className="font-display text-menu-fg text-h7 mt-6.25 leading-none font-bold tracking-[0.02em] uppercase">
          {d.selectSize}
        </p>
        <div
          ref={sizeGroup}
          role="radiogroup"
          aria-labelledby="size-label"
          className="mt-2 flex flex-wrap gap-3.75"
        >
          {product.sizes.map((option) => {
            const selected = option === size;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSize(option)}
                // The colour lives ONLY in the branches. Left in the base
                // string as well, `text-menu-fg` and `text-ink` are two
                // same-property utilities in one class attribute and the
                // generated stylesheet's order decides the winner, not this
                // one — which is how the chosen chip came out white on white.
                className={`font-display h-13 w-14.25 cursor-pointer border text-[1.375rem] leading-none font-semibold tracking-[-0.02em] transition-colors duration-150 ease-gate ${
                  selected
                    ? "border-menu-fg bg-menu-fg text-ink"
                    : "border-menu-fg/40 text-menu-fg hover:border-menu-fg/70"
                } focus-visible:outline-signal focus-visible:outline-2 focus-visible:outline-offset-2`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* ---- Description ---- */}
        <p className="font-display text-menu-fg text-h7 mt-6.5 leading-none font-bold tracking-[0.02em] uppercase">
          {d.description}
        </p>
        <p className="text-menu-fg font-body mt-1 max-w-125 text-body leading-5.75">
          {copy.description}
        </p>

        {/* ---- Quantity and add ---- */}
        <div className="mt-10 flex flex-wrap items-stretch gap-6.25">
          <div className="border-menu-fg/30 flex h-13.75 w-40 items-center justify-between border px-5">
            <Stepper
              label={d.decrease}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              glyph="−"
            />
            <span aria-live="polite" aria-label={d.quantity} className="text-menu-fg font-body text-body">
              {quantity}
            </span>
            <Stepper
              label={d.increase}
              onClick={() => setQuantity((q) => q + 1)}
              glyph="+"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!size) {
                sizeGroup.current?.querySelector("button")?.focus();
                return;
              }
              add({ slug: product.slug, colourId, size, quantity });
            }}
            className="bg-signal text-menu-fg font-display focus-visible:outline-signal h-13.75 flex-1 cursor-pointer text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase transition-opacity duration-150 ease-gate hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 lg:min-w-79.75"
          >
            {d.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}


function Stepper({
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
