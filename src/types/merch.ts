import type { Messages } from "@/lib/utils/messages";

/**
 * Contracts for the merch store.
 *
 * The store's shapes. They live here rather than beside a component
 * (coding-standard, "Shared types"); `src/lib/api/merch.ts` maps the API's
 * replies into them, so a reply that changes changes only that adapter.
 *
 * AN ITEM CARRIES ITS OWN COPY (`copy`): what an admin typed, in English - the
 * API keeps one language.
 *
 * MONEY IS AN INTEGER NUMBER OF NAIRA, not a formatted string and not a float.
 * The frames show ₦10,000; formatting is the view's job and belongs next to the
 * locale, not next to the number. Floats are wrong for money for the usual
 * reason, and kobo are not used anywhere in these designs.
 */

/** Which flat field a product's tile is painted in. Set by Design, per product. */
export type TileField = "linen" | "crimson" | "white";

/**
 * A colourway. `swatch` is a token name, never a hex - see coding-standard.
 * A standard colour's name is a key into the copy; any other is the API's own (`label`).
 */
export type ProductColour = {
  id: string;
  /** Key into `messages.merch.colours`. */
  labelKey?: keyof Messages["merch"]["colours"];
  /** The colour's name as printed, for one the copy doesn't name. */
  label?: string;
  /** `--color-*` token name the swatch is painted in. */
  swatch: string;
};

/** The standard sizes, in order. A product's own are whatever its variants say. */
export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

/** A product's name, description and image text, as printed. */
export type ProductCopy = { name: string; description: string; imageAlt: string };

/** One thing the cart can hold: a colour in a size, with its own id at the API. */
export type ProductVariant = {
  id: string;
  /** The colour's `id`, or "" for a product with no colours. */
  colourId: string;
  /** The size, or "" for a product with no sizes. */
  size: string;
  /** Whole naira. */
  price: number;
  /** Null where the API keeps no count. */
  stock: number | null;
};

export type Product = {
  /** URL segment, English per the route naming rule. */
  slug: string;
  /** Its name, description and image text, as an admin typed them. */
  copy: ProductCopy;
  /** Whole naira. */
  price: number;
  image: string;
  tile: TileField;
  /** Drawn as the EXCLUSIVE plate on the tile. */
  exclusive: boolean;
  /** Empty for a product sold in one colour, which shows no picker. */
  colours: readonly ProductColour[];
  /** Empty for a product sold in one size, which shows no picker. */
  sizes: readonly string[];
  /** Live only: what the cart adds, by colour and size. */
  variants?: readonly ProductVariant[];
};

/**
 * One entry in a listing.
 *
 * SEPARATE FROM `Product` ON PURPOSE. The frame's grid shows six cards drawn
 * from three products - the same catalogue repeated, exactly as the About team
 * grid repeats two portraits. A listing is therefore an ordered list of
 * references with its own stable keys, not the catalogue itself, and swapping in
 * a real backend's product list changes nothing about how the grid renders.
 */
export type ListingEntry = {
  /** Stable React key. Unique even where two entries share a product. */
  id: string;
  slug: string;
};

/**
 * A comic issue.
 *
 * THE COVER IS COMPOSED, NOT A FILE. The frames build each one out of parts: a
 * dark band carrying a volume chip and the title, a torn seam, a coloured field
 * below it, and a character render laid over the join. Goondu delivered the
 * renders - `soma-gate-character.png`, `soma-mysc.png`, `weapon-spear.png` -
 * and not flattened covers, so the page assembles what the design assembles.
 *
 * That is also why framing arrives as literal Tailwind classes, the same way
 * `characters.ts` and `team.ts` hand-place art that no single object-fit rule
 * reproduces.
 */
/** How a chapter is bought: read in the reader, or the printed book shipped. */
export type ComicFormat = "online" | "physical";

/**
 * One chapter of a comic, as the store sells it (the team's rules, 2026-10-01):
 * every chapter is sold on its own, online and/or in print. A whole volume is
 * never sold online.
 */
/** A chapter's printed copy. */
export type IssueCopy = {
  title: string;
  /** The cover's chip: "VOL. 1". */
  volume: string;
  meta: string;
  format: string;
  description: string;
  coverAlt: string;
  /** The cover's title, broken where `\n` says. */
  coverTitle: string;
};

export type ComicIssue = {
  slug: string;
  /** Its title and the words around it, as an admin typed them. */
  copy: IssueCopy;
  /** What each format costs. A format left out is not sold for this chapter. */
  formats: Partial<Record<ComicFormat, number>>;
  /** Live only: the cart's variant for each format sold. */
  variants?: Partial<Record<ComicFormat, string>>;
  /** How many of each format the API has; null where it keeps no count. */
  stock?: Partial<Record<ComicFormat, number | null>>;
  /** The volume's number; 0 where the source doesn't say (a live chapter). */
  volume: number;
  /** Its place in the volume: Chapter 1, 2… */
  chapter: number;
  cover: {
    /**
     * A live chapter's cover, a FILE an admin uploaded. Titled (below), it is
     * the composition's field; otherwise it is drawn as it is, in place of the
     * composition (whose fields the adapter still fills, for the cart's
     * thumbnail ground).
     */
    image?: string;
    /**
     * The admin's Cover style. True draws the frame's band over the
     * uploaded file - torn seam, volume chip, title - as the composed covers
     * have it. False is for a file that already carries its own title.
     */
    titled?: boolean;
    /**
     * WHOLE TAILWIND CLASS NAMES, never derived at runtime.
     *
     * `field.replace("bg-", "text-")` was tried for the seam and produced a
     * class that had never been generated - Tailwind scans source text, so
     * `text-abyss` existed nowhere and the seam fell back to `currentColor`,
     * which inherited near-white and drew two white blobs on the cover. Each
     * class is written out for exactly that reason.
     */
    band: string;
    field: string;
    seam: string;
    /**
     * How the render sits in the cover, because the two frames do it
     * differently and the difference is structural rather than cosmetic.
     *
     *   "figure" - a cutout placed by hand, painted IN FRONT of the torn seam.
     *              Volume 1: Soma's head crosses the seam into the band above it.
     *   "field" - the render IS the field, covering it edge to edge and running
     *              up BEHIND the seam. Volume 2's studio backdrop is baked into
     *              the file, so there is no flat colour to show.
     */
    figureMode: "figure" | "field";
    /** Chip, title and partner line are left on volume 1 and centred on volume 2. */
    align: "left" | "center";
    /** Token for the volume chip. */
    chip: string;
    /**
     * The character render, and how it sits in the cover box ("figure") or in
     * the field ("field": `object-*` classes).
     */
    figure: string;
    figureClass: string;
    /** An optional second render behind the figure - the spear on volume 1. */
    prop?: string;
    propClass?: string;
  };
};

/** A line in the cart. Colour and size are part of the identity, not metadata. */
export type CartLine = {
  slug: string;
  colourId: string;
  size: string;
  quantity: number;
  /** Live only: the variant the API's cart holds. */
  variantId?: string;
};

/**
 * The community points balance shown to a signed-in visitor.
 *
 * `nextTierAt` is what the frame's "Next price is 500 points away" is computed
 * from, so the copy takes a number rather than baking one into a sentence.
 */
export type PointsBalance = {
  points: number;
  /** The next tier's threshold. Absent: the API has no tiers, so no progress bar. */
  nextTierAt?: number;
  /** Keys into `messages.merch.points.perks`. */
  perkKeys: readonly string[];
};

/**
 * What a placed order looks like. NOTHING IN THIS BUILD CREATES ONE against a
 * server - the checkout screens advance to the confirmation view and no payment
 * is taken, no card detail is ever collected. The type exists so the screens are
 * built against the shape a real order will have.
 */
export type Order = {
  reference: string;
  lines: readonly CartLine[];
  subtotal: number;
  pointsDiscount: number;
  shipping: number;
  total: number;
};
