import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { TornPlate } from "@/components/ui/TornPlate";
import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Product, TileField } from "@/types/merch";

const FIELD: Record<TileField, string> = {
  linen: "bg-linen",
  crimson: "bg-crimson",
  white: "bg-menu-fg",
};

/**
 * The store's top row: the featured product on a wide tile, and whatever the
 * viewer's state puts beside it.
 *
 * Frame at 1440 — tile 80..840 x 197..768, right column 903..1356, so 760 and
 * 453 of a 1280 container. The aside is a slot because all three store frames
 * share this row and differ only in what fills it: the login offer when signed
 * out, the points panels when signed in.
 */
export function StoreHero({
  product,
  messages,
  locale,
  aside,
}: {
  product: Product;
  messages: Messages;
  locale: Locale;
  aside: ReactNode;
}) {
  const t = messages.merch;
  const copy = t.products[product.copyKey];

  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[59.375%_35.4%] lg:justify-between lg:gap-0">
      <Link
        href={`/${locale}/merch/${product.slug}`}
        className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className={`relative aspect-[760/571] w-full overflow-hidden ${FIELD[product.tile]}`}>
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
            sizes="(max-width: 1023px) 92vw, 60vw"
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>

        <div className="mt-5.25 flex items-baseline justify-between gap-4 px-3">
          <h2 className="font-display text-menu-fg text-[2rem] leading-none font-semibold tracking-[-0.065em] uppercase">
            {copy.name}
          </h2>
          <p className="font-display text-menu-fg text-[2rem] leading-none font-semibold tracking-[-0.065em]">
            {formatPrice(product.price, locale, t.price)}
          </p>
        </div>
      </Link>

      {/* The torn login card overhangs the tile's top by 5px in the frame; the
          ash panels do not, so the offset belongs to the card and not here. */}
      <aside>{aside}</aside>
    </div>
  );
}
