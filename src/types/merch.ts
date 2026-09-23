import type { Messages } from "@/lib/utils/messages";

/**
 * Contracts for the merch store.
 *
 * THESE ARE THE SHAPES THE GAME TEAM'S BACKEND WILL EVENTUALLY RETURN, which is
 * why they live here rather than beside a component (coding-standard, "Shared
 * types"). Nothing in `src/components/merch` imports a mock; everything goes
 * through `src/lib/api/merch.ts`, so when a real endpoint lands only the adapter
 * changes and the mapping happens at that boundary.
 *
 * COPY IS NOT IN HERE. Every user-facing string is a key into `src/messages`,
 * the same join `characters.ts` makes with `castKey`. A product's name and
 * description have to exist in English and Igbo, and a data file is the one
 * place they must never be written.
 *
 * MONEY IS AN INTEGER NUMBER OF NAIRA, not a formatted string and not a float.
 * The frames show ₦10,000; formatting is the view's job and belongs next to the
 * locale, not next to the number. Floats are wrong for money for the usual
 * reason, and kobo are not used anywhere in these designs.
 */

/** Which flat field a product's tile is painted in. Set by Design, per product. */
export type TileField = "linen" | "crimson" | "white";

/** A colourway. `swatch` is a token name, never a hex - see coding-standard. */
export type ProductColour = {
  id: string;
  /** Key into `messages.merch.colours`. */
  labelKey: keyof Messages["merch"]["colours"];
  /** `--color-*` token name the swatch is painted in. */
  swatch: string;
};

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type Product = {
  /** URL segment, English per the route naming rule. */
  slug: string;
  /** Key into `messages.merch.products`. */
  copyKey: keyof Messages["merch"]["products"];
  /** Whole naira. */
  price: number;
  image: string;
  tile: TileField;
  /** Drawn as the EXCLUSIVE plate on the tile. */
  exclusive: boolean;
  colours: readonly ProductColour[];
  sizes: readonly ProductSize[];
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
export type ComicIssue = {
  slug: string;
  /** Key into `messages.merch.comics.issues`. */
  copyKey: string;
  price: number;
  /** `Online` or `Physical`, as the frame labels them. */
  format: "online" | "physical";
  volume: number;
  /**
   * The reader's pages, in order. Empty means the issue is not readable yet and
   * START READING has nowhere to go.
   *
   * FLAGGED: one page was delivered (`comics/c1.png`) and the frame stacks
   * several. It is repeated to fill the reader rather than substituted with
   * anything invented, and the repetition is visible in this list.
   */
  pages: readonly string[];
  cover: {
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
    /** The character render, and how it sits in the cover box. */
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
  size: ProductSize;
  quantity: number;
};

/**
 * The community points balance shown to a signed-in visitor.
 *
 * `nextTierAt` is what the frame's "Next price is 500 points away" is computed
 * from, so the copy takes a number rather than baking one into a sentence.
 */
export type PointsBalance = {
  points: number;
  nextTierAt: number;
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
