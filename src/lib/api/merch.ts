import type {
  ComicIssue,
  ListingEntry,
  Product,
  ProductColour,
  ProductSize,
} from "@/types/merch";

/**
 * The merch catalogue, behind a typed contract.
 *
 * THIS IS THE MOCK IMPLEMENTATION AND THE ONLY FILE THAT KNOWS IT IS ONE. There
 * is no backend in this phase (overview section 9), so the functions below
 * resolve from the constants in this file. When the game team ships a real
 * endpoint, this file changes and nothing else does: components read through
 * these functions and receive `Product`, never a row shape.
 *
 * They are `async` even though nothing awaits, precisely so that swap is not a
 * change of signature at fifty call sites.
 *
 * THE ERRORS ARE NORMALISED. `getProduct` throws `MerchNotFoundError` rather
 * than returning null, per coding-standard's error rule: a caller that asked for
 * a slug that does not exist has a bug or a bad URL, and both want a thrown,
 * typed failure that a route can turn into `notFound()`.
 */

export class MerchNotFoundError extends Error {
  constructor(readonly slug: string) {
    super(`No merch product with slug "${slug}"`);
    this.name = "MerchNotFoundError";
  }
}

const SIZES: readonly ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/**
 * The three colourways the detail frame draws, as swatch TOKENS rather than
 * hexes — a component must never carry a raw colour.
 *
 * Read off the frame's swatch row: #000000, #550800, #fffcf2. The first is
 * `--color-ink` exactly; the other two are the merch section's two new
 * colourway tokens.
 *
 * FLAGGED: "Oxblood" is ours. The frames never name that swatch — the cart
 * labels only Black and White — and a colour needs a name to be operable from
 * the keyboard. Ask Design for the real word.
 */
const COLOURS: readonly ProductColour[] = [
  { id: "black", labelKey: "black", swatch: "bg-ink" },
  { id: "oxblood", labelKey: "oxblood", swatch: "bg-cocoa" },
  { id: "white", labelKey: "white", swatch: "bg-ivory" },
] as const;

/**
 * The catalogue.
 *
 * FOUR PRODUCTS, AND THE FRAME'S SIX CARDS ARE THREE OF THEM TWICE. Prices are
 * the frame's ₦10,000 throughout — that is what Design drew on every card, not a
 * placeholder we chose. Tile fields are per product and were read off the
 * frame: the tote sits on white, the beanie on crimson, the tee and the hoodie
 * on linen, in both rows.
 */
const PRODUCTS: readonly Product[] = [
  {
    slug: "goondu-hoodie",
    copyKey: "hoodie",
    price: 10000,
    image: "/assets/merch/Hoodie 2 2.png",
    tile: "linen",
    exclusive: true,
    colours: COLOURS,
    sizes: SIZES,
  },
  {
    slug: "goondu-tote",
    copyKey: "tote",
    price: 10000,
    image: "/assets/merch/Tote 2 1.png",
    tile: "white",
    exclusive: false,
    colours: COLOURS,
    sizes: SIZES,
  },
  {
    slug: "goondu-beanie",
    copyKey: "beanie",
    price: 10000,
    image: "/assets/merch/beanie 1 2.png",
    tile: "crimson",
    exclusive: false,
    colours: COLOURS,
    sizes: SIZES,
  },
  {
    slug: "goondu-tee",
    copyKey: "tee",
    price: 10000,
    image: "/assets/merch/Tshirt 1 1.png",
    tile: "linen",
    exclusive: false,
    colours: COLOURS,
    sizes: SIZES,
  },
] as const;

/**
 * The grid, in the frame's order: tote, beanie, tee, then beanie, tee, tote.
 *
 * A LISTING IS NOT THE CATALOGUE. Six cards, three products — the repetition is
 * what Design drew, and it lives here as an ordered list of references so the
 * grid never has to know that two cards point at one product.
 */
const LISTING: readonly ListingEntry[] = [
  { id: "listing-1", slug: "goondu-tote" },
  { id: "listing-2", slug: "goondu-beanie" },
  { id: "listing-3", slug: "goondu-tee" },
  { id: "listing-4", slug: "goondu-beanie" },
  { id: "listing-5", slug: "goondu-tee" },
  { id: "listing-6", slug: "goondu-tote" },
] as const;

/** The product the store index features above the fold. */
export async function getFeaturedProduct(): Promise<Product> {
  return getProduct("goondu-hoodie");
}

export async function getProducts(): Promise<readonly Product[]> {
  return PRODUCTS;
}

export async function getListing(): Promise<readonly (ListingEntry & { product: Product })[]> {
  return LISTING.map((entry) => {
    const product = PRODUCTS.find((p) => p.slug === entry.slug);
    if (!product) throw new MerchNotFoundError(entry.slug);
    return { ...entry, product };
  });
}

export async function getProduct(slug: string): Promise<Product> {
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) throw new MerchNotFoundError(slug);
  return product;
}

/**
 * What the detail page's YOU MIGHT ALSO LIKE row shows: the rest of the
 * catalogue, in catalogue order. The frame draws three beside the hoodie, which
 * is what four products minus the one being viewed comes to.
 */
export async function getRelated(slug: string): Promise<readonly Product[]> {
  return PRODUCTS.filter((p) => p.slug !== slug);
}

/**
 * The comics.
 *
 * The covers are assembled rather than loaded — see `ComicIssue` — because what
 * Goondu delivered is character renders, which is also what the frames compose
 * their covers from.
 *
 * FLAGGED: volume 2 has no synopsis in any frame. Its `description` key is empty
 * and the detail page renders nothing there rather than borrowing volume 1's.
 */
const COMICS: readonly ComicIssue[] = [
  {
    slug: "trial-of-the-gods",
    copyKey: "trial",
    price: 10000,
    format: "physical",
    volume: 1,
    pages: ["/assets/comics/c1.png", "/assets/comics/c1.png", "/assets/comics/c1.png"],
    cover: {
      band: "bg-menu",
      field: "bg-clot",
      seam: "text-menu",
      figureMode: "figure",
      align: "left",
      chip: "text-ink bg-[url('/assets/ornaments/onu-uzo-chip.svg')]",
      figure: "/assets/comics/soma-gate-character.png",
      // The render is a 4096 square with the figure filling its height, so it
      // is placed by hand rather than covered.
      // Recovered by normalised cross-correlation rather than by eye: the
      // frame's face-and-shoulder patch matched the scaled render at NCC 0.874,
      // putting a 384px square element at (74, 199) in a 414 x 567 cover.
      figureClass: "left-[17.9%] top-[35.1%] w-[92.8%]",
      prop: "/assets/comics/weapon-spear.png",
      // SOLVED FROM TWO LANDMARKS, NOT BY EYE. The crystal's tip and the gold
      // binding below it are both visible in the frame and in the file, and two
      // corresponding points fix scale, angle and position exactly:
      //
      //   file   tip (1962.7, 36.6)   binding (1609.7, 369.6)   |v| 485.3  136.7°
      //   frame  tip (347, 79.5)      binding (321, 177)        |v| 100.9  105.0°
      //
      // so scale 0.2079, rotation -31.7°, and solving the element's centre for
      // the tip's landing gives the offsets below. Checked against the binding:
      // predicted (320.9, 177.0) against the frame's (321, 177).
      //
      // THE FILE HAS BEEN REPLACED ONCE ALREADY (1156x1688 -> 2016x2112), which
      // silently invalidated the previous numbers. If it changes again, re-solve
      // rather than nudge.
      propClass: "top-[25.5%] left-[19.3%] w-[101.2%] rotate-[-31.7deg]",
    },
  },
  {
    slug: "between-worlds",
    copyKey: "between",
    price: 10000,
    format: "online",
    volume: 2,
    pages: [],
    cover: {
      band: "bg-dusk",
      field: "bg-abyss",
      // The seam is painted in the BAND's colour and laid over the render,
      // because the render runs up behind it.
      seam: "text-dusk",
      figureMode: "field",
      align: "center",
      // The cyan plate Goondu delivered — `#5EC1CE`, which closes the colour
      // `Chip` still raises as unconfirmed for gate 2.
      chip: "text-ink bg-[url('/assets/ornaments/onu-uzo-blue.svg')]",
      figure: "/assets/comics/soma-mysc.png",
      figureClass: "",
    },
  },
] as const;

export async function getComics(): Promise<readonly ComicIssue[]> {
  return COMICS;
}

export async function getComic(slug: string): Promise<ComicIssue> {
  const issue = COMICS.find((c) => c.slug === slug);
  if (!issue) throw new MerchNotFoundError(slug);
  return issue;
}

/** The detail page's row: the other issues, repeated to the four the frame draws. */
export async function getRelatedComics(slug: string): Promise<readonly ComicIssue[]> {
  const others = COMICS.filter((c) => c.slug !== slug);
  if (!others.length) return [];
  return Array.from({ length: 4 }, (_, i) => others[i % others.length]);
}
