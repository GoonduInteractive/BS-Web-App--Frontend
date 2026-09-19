import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { CartLine, ComicIssue, Product, TileField } from "@/types/merch";

/** The tile grounds, in one place rather than copied into every consumer. */
const FIELD: Record<TileField, string> = {
  linen: "bg-linen",
  crimson: "bg-crimson",
  white: "bg-menu-fg",
};

/**
 * One cart line, flattened to everything a row needs to draw itself.
 *
 * WHY THIS EXISTS. The cart, the checkout summary and the transfer screen each
 * resolved a line by searching the PRODUCT list alone:
 *
 *   products.find((p) => p.slug === line.slug)
 *
 * A comic's slug is in no product list, so the lookup returned undefined and the
 * line was silently filtered out — while `count` still included it. Adding a
 * comic to the cart therefore bumped the badge and showed nothing, and the
 * totals were short by exactly that line. Fixing it in one of the three places
 * would have left the other two wrong, so resolution lives here and all three
 * call it.
 *
 * Copy stays in `src/messages` — this reads it, it does not hold it.
 */
export type CartEntry = {
  line: CartLine;
  slug: string;
  name: string;
  image: string;
  price: number;
  /** Whole Tailwind class for the ground behind the thumbnail. */
  tileClass: string;
  /** Where the row links to. */
  href: string;
  /**
   * Whether the row shows Colour and Size.
   *
   * A comic has neither — it is one thing — so its line carries the placeholder
   * colour and size the cart's identity needs and hides both rows.
   */
  variant: boolean;
};

export function resolveCartLines({
  lines,
  products,
  comics,
  messages,
  locale,
}: {
  lines: readonly CartLine[];
  products: readonly Product[];
  comics: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
}): CartEntry[] {
  const t = messages.merch;

  return lines.flatMap((line): CartEntry[] => {
    const product = products.find((p) => p.slug === line.slug);
    if (product) {
      return [
        {
          line,
          slug: product.slug,
          name: t.products[product.copyKey].name,
          image: product.image,
          price: product.price,
          tileClass: FIELD[product.tile],
          href: `/${locale}/merch/${product.slug}`,
          variant: true,
        },
      ];
    }

    const issue = comics.find((c) => c.slug === line.slug);
    if (issue) {
      const copy = t.comics.issues[issue.copyKey as keyof typeof t.comics.issues];
      return [
        {
          line,
          slug: issue.slug,
          name: copy.title,
          // The cover is composed rather than a file, so a row thumbnail uses
          // the issue's own render on the cover's band colour.
          image: issue.cover.figure,
          price: issue.price,
          tileClass: issue.cover.band,
          href: `/${locale}/merch/comics/${issue.slug}`,
          variant: false,
        },
      ];
    }

    // A slug in storage that matches nothing today — a product withdrawn since
    // the visitor last shopped. Dropping it is correct; it must not be counted.
    return [];
  });
}

/** Line total for one entry. */
export function entryTotal(entry: CartEntry): number {
  return entry.price * entry.line.quantity;
}
