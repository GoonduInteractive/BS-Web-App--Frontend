import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Product, TileField } from "@/types/merch";

/** Tile fields, as tokens. A raw hex never reaches a component. */
const FIELD: Record<TileField, string> = {
  linen: "bg-linen",
  crimson: "bg-crimson",
  white: "bg-menu-fg",
};


export function ProductCard({
  product,
  messages,
  locale,
  priority = false,
}: {
  product: Product;
  messages: Messages;
  locale: Locale;
  priority?: boolean;
}) {
  const copy = messages.merch.products[product.copyKey];

  return (
    <Link
      href={`/${locale}/merch/${product.slug}`}
      className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className={`relative aspect-[406/524] w-full overflow-hidden ${FIELD[product.tile]}`}>
        <Image
          src={product.image}
          alt={copy.imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
          className="object-contain transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="mt-6.75 flex items-baseline justify-between gap-4 px-3">
        <h3 className="font-display text-menu-fg text-[2.0625rem] leading-none font-semibold tracking-[-0.065em] uppercase">
          {copy.name}
        </h3>
        <p className="font-display text-menu-fg text-[2.0625rem] leading-none font-semibold tracking-[-0.065em]">
          {formatPrice(product.price, locale, messages.merch.price)}
        </p>
      </div>
    </Link>
  );
}
