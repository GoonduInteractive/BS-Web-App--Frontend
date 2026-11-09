import { cache } from "react";
import { z } from "zod";

import type {
  ComicIssue,
  ListingEntry,
  Product,
  ProductColour,
  ProductSize,
} from "@/types/merch";
import type { BandColour } from "@/types/news";

import { ApiError, apiGet, fromMinor } from "./client";

/**
 * The merch catalogue, behind a typed contract: the game backend's
 * `/v1/products`. Apparel becomes `Product`, comics `ComicIssue`, read on the
 * server at build and whenever the store's pages revalidate. Components read
 * through these functions and receive `Product`, never a row shape.
 *
 * THE STORE IS READ AS ANYONE - public since 2026-10-27 (it answered 401
 * before). Should the API refuse again, the store is EMPTY - its pages show the
 * Coming Soon state - rather than a broken build.
 *
 * THE LIST IS ASKED FOR BY CATEGORY: `category` (apparel | comic) is required
 * on `/v1/products` and on `/related` (with `relatedToSlug`, the product's own
 * slug again), so the catalogue is two lists.
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
 * hexes - a component must never carry a raw colour.
 *
 * Read off the frame's swatch row: #000000, #550800, #fffcf2. The first is
 * `--color-ink` exactly; the other two are the merch section's two new
 * colourway tokens.
 *
 * FLAGGED: "Oxblood" is ours. The frames never name that swatch - the cart
 * labels only Black and White - and a colour needs a name to be operable from
 * the keyboard. Ask Design for the real word.
 */
const COLOURS: readonly ProductColour[] = [
  { id: "black", labelKey: "black", swatch: "bg-ink" },
  { id: "oxblood", labelKey: "oxblood", swatch: "bg-cocoa" },
  { id: "white", labelKey: "white", swatch: "bg-ivory" },
] as const;

/**
 * The product the store index features above the fold: the first an admin
 * marked exclusive, else the first. Null for an empty store.
 */
export async function getFeaturedProduct(): Promise<Product | null> {
  const { products } = await catalogue();
  return products.find((p) => p.exclusive) ?? products[0] ?? null;
}

export async function getProducts(): Promise<readonly Product[]> {
  return (await catalogue()).products;
}

export async function getListing(): Promise<readonly (ListingEntry & { product: Product })[]> {
  // Every product once: the frame's repetition was a comp filling a grid.
  return (await catalogue()).products.map((product) => ({ id: product.slug, slug: product.slug, product }));
}

export async function getProduct(slug: string): Promise<Product> {
  const product = (await getProducts()).find((p) => p.slug === slug);
  if (!product) throw new MerchNotFoundError(slug);
  return product;
}

/**
 * What the detail page's YOU MIGHT ALSO LIKE row shows: the API's own pick
 * (`/related`), else the rest of the catalogue.
 */
export async function getRelated(slug: string): Promise<readonly Product[]> {
  const products = await getProducts();
  const others = products.filter((p) => p.slug !== slug);

  const query = new URLSearchParams({ limit: "3", category: "apparel", relatedToSlug: slug });
  const related = await apiGet(`/v1/products/${encodeURIComponent(slug)}/related?${query}`, relatedReply).catch(() => null);
  const picked = (related ? (Array.isArray(related) ? related : related.items) : []).flatMap(
    (item) => others.find((p) => p.slug === item.slug) ?? [],
  );
  return picked.length ? picked : others.slice(0, 3);
}

export async function getComics(): Promise<readonly ComicIssue[]> {
  return (await catalogue()).comics;
}

export async function getComic(slug: string): Promise<ComicIssue> {
  const issue = (await getComics()).find((c) => c.slug === slug);
  if (!issue) throw new MerchNotFoundError(slug);
  return issue;
}

/** The detail page's row: the other issues, each once, up to four. */
export async function getRelatedComics(slug: string): Promise<readonly ComicIssue[]> {
  const others = (await getComics()).filter((c) => c.slug !== slug);
  if (!others.length) return [];
  return others.slice(0, 4);
}

/**
 * Every variant the cart can hold, and the cart line it stands for, so the
 * browser can turn the API's cart (variant ids) back into lines and a line
 * back into a variant.
 */
export type CartIndexEntry = { variantId: string; slug: string; colourId: string; size: string };

export async function getCartIndex(): Promise<readonly CartIndexEntry[]> {
  const { products, comics } = await catalogue();
  return [
    ...products.flatMap((p) =>
      (p.variants ?? []).map((v) => ({ variantId: v.id, slug: p.slug, colourId: v.colourId, size: v.size })),
    ),
    // A comic line carries its format in `colourId` and the cart's placeholder size (`ComicDetail`).
    ...comics.flatMap((c) =>
      Object.entries(c.variants ?? {}).map(([format, id]) => ({ variantId: id, slug: c.slug, colourId: format, size: "M" })),
    ),
  ];
}

/* ------------------------------------------------------------------------ */
/* Live                                                                       */
/* ------------------------------------------------------------------------ */

const apiVariant = z.object({
  id: z.string(),
  price_minor: z.coerce.number().nullish(),
  stock: z.number().nullish(),
  fulfillment: z.string().nullish(),
  size: z.string().nullish(),
  color: z.string().nullish(),
});

const apiProduct = z.object({
  slug: z.string(),
  title: z.string(),
  type: z.string(),
  exclusive: z.boolean().default(false),
  description: z.string().nullish(),
  price_minor: z.coerce.number(),
  cover_image_url: z.string().nullish(),
  status: z.string().nullish(),
  deleted: z.boolean().optional(),
  chapter: z
    .object({
      number: z.number().nullish(),
      description: z.string().nullish(),
      cover_image_url: z.string().nullish(),
      // The admin's Cover style - asked of the backend 2026-10-30, not in the API yet (`toIssue`).
      cover_style: z.string().nullish(),
      cover_title: z.string().nullish(),
      cover_volume_label: z.string().nullish(),
      cover_band: z.string().nullish(),
    })
    .nullish(),
  variants: z.array(apiVariant).default([]),
});
type ApiProduct = z.output<typeof apiProduct>;

const listItem = z.object({ slug: z.string() });
const relatedReply = z.union([z.array(listItem), z.object({ items: z.array(listItem) })]);

/** How many products the store reads. FLAGGED: past this, the rest are left out. */
const PAGE = 100;

/** The three colourways the frames draw keep their tokens; any other gets a neutral swatch and its own name. */
function colourOf(name: string): ProductColour {
  const standard = COLOURS.find((c) => c.id === name.trim().toLowerCase());
  if (standard) return standard;
  return { id: `custom-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label: name.trim(), swatch: "bg-slate" };
}

/** Sizes in the frames' order, any others after. */
const sizeOrder = (size: string) => {
  const at = SIZES.indexOf(size.toUpperCase() as ProductSize);
  return at < 0 ? SIZES.length : at;
};

function toProduct(d: ApiProduct, image: string): Product {
  const price = fromMinor(d.price_minor);
  const variants = d.variants.map((v) => ({
    id: v.id,
    colourId: v.color ? colourOf(v.color).id : "",
    size: v.size?.trim() ?? "",
    price: v.price_minor != null ? fromMinor(v.price_minor) : price,
    stock: v.stock ?? null,
  }));
  const colours = [...new Map(d.variants.flatMap((v) => (v.color ? [[colourOf(v.color).id, colourOf(v.color)] as const] : []))).values()];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))].sort((a, b) => sizeOrder(a) - sizeOrder(b));
  return {
    slug: d.slug,
    copy: { name: d.title, description: d.description ?? "", imageAlt: d.title },
    price,
    image,
    // Design sets a tile's ground per product and the API has none: linen, the frames' commonest. FLAGGED.
    tile: "linen",
    exclusive: d.exclusive,
    colours,
    sizes,
    variants,
  };
}

const BLUE_CHIP = "text-ink bg-[url('/assets/ornaments/onu-uzo-blue.svg')]";
const CREAM_CHIP = "text-ink bg-[url('/assets/ornaments/onu-uzo-chip.svg')]";

/**
 * A titled cover's band, by the colour the admin picked: the news covers'
 * palette and chip pairing (`components/news/bands.ts`), as whole classes.
 */
const COVER_BANDS: Record<BandColour, Pick<ComicIssue["cover"], "band" | "seam" | "chip">> = {
  dusk: { band: "bg-dusk", seam: "text-dusk", chip: BLUE_CHIP },
  clot: { band: "bg-clot", seam: "text-clot", chip: CREAM_CHIP },
  ember: { band: "bg-ember", seam: "text-ember", chip: CREAM_CHIP },
  oxblood: { band: "bg-oxblood", seam: "text-oxblood", chip: CREAM_CHIP },
  blood: { band: "bg-blood", seam: "text-blood", chip: CREAM_CHIP },
  carmine: { band: "bg-carmine", seam: "text-carmine", chip: CREAM_CHIP },
  crimson: { band: "bg-crimson", seam: "text-crimson", chip: CREAM_CHIP },
  menu: { band: "bg-menu", seam: "text-menu", chip: CREAM_CHIP },
  abyss: { band: "bg-abyss", seam: "text-abyss", chip: BLUE_CHIP },
  ash: { band: "bg-ash", seam: "text-ash", chip: BLUE_CHIP },
};

/**
 * A chapter's cover is TITLED unless its admin chose the full image: the
 * frame's band over the upload, torn into it, with the volume tag and the
 * title - the cover title if one was set (a newline breaks the line), else the
 * chapter's. The band is near-black, as on volume 1, unless another was picked.
 *
 * FLAGGED: the Cover style fields (`cover_style`, `cover_title`,
 * `cover_volume_label`, `cover_band`) were asked of the backend on 2026-10-30.
 * Until it sends them every cover is titled, with no volume tag: the public
 * chapter names its volume by id only.
 */
function toIssue(d: ApiProduct, image: string): ComicIssue {
  const online = d.variants.find((v) => v.fulfillment === "digital");
  const print = d.variants.find((v) => v.fulfillment === "physical");
  const price = (v: z.output<typeof apiVariant>) => fromMinor(v.price_minor ?? d.price_minor);
  const c = d.chapter;
  const band = COVER_BANDS[c?.cover_band as BandColour] ?? COVER_BANDS.menu;
  return {
    slug: d.slug,
    // The meta line needs a date; a chapter product carries none (FLAGGED), so it prints nothing.
    copy: {
      title: d.title,
      volume: c?.cover_volume_label?.trim() ?? "",
      meta: "",
      format: "",
      description: d.description ?? c?.description ?? "",
      coverAlt: d.title,
      coverTitle: c?.cover_title?.trim() || d.title,
    },
    formats: { ...(online && { online: price(online) }), ...(print && { physical: price(print) }) },
    variants: { ...(online && { online: online.id }), ...(print && { physical: print.id }) },
    stock: { ...(online && { online: online.stock ?? null }), ...(print && { physical: print.stock ?? null }) },
    volume: 0,
    chapter: d.chapter?.number ?? 0,
    // Read in the reader by whoever owns it (`/v1/comics/{slug}`), not from here.
    cover: {
      image,
      titled: c?.cover_style !== "full",
      ...band,
      field: "bg-abyss",
      // The upload is the field, covering it from the top down: a figure's head
      // matters more than its feet.
      figureMode: "field",
      align: "left",
      figure: image,
      figureClass: "object-cover object-top",
    },
  };
}

/** The whole live store, read once per render. */
const catalogue = cache(async (): Promise<{ products: readonly Product[]; comics: readonly ComicIssue[] }> => {
  const listOf = (category: "apparel" | "comic") =>
    apiGet(`/v1/products?page=1&limit=${PAGE}&category=${category}`, z.object({ items: z.array(listItem) }));
  let list: z.output<typeof listItem>[];
  try {
    const [apparel, comics] = await Promise.all([listOf("apparel"), listOf("comic")]);
    list = [...apparel.items, ...comics.items];
  } catch (e) {
    // Closed to anyone not signed in - see the note at the top.
    if (e instanceof ApiError && e.status === 401) return { products: [], comics: [] };
    throw e;
  }
  const details = await Promise.all(list.map((item) => apiGet(`/v1/products/${encodeURIComponent(item.slug)}`, apiProduct)));
  const onSale = details.filter((d) => (!d.status || d.status === "published") && !d.deleted);
  return {
    // A product with no picture has nothing for its tile to show: left out. FLAGGED.
    products: onSale.flatMap((d) => (d.type === "apparel" && d.cover_image_url ? [toProduct(d, d.cover_image_url)] : [])),
    comics: onSale.flatMap((d) => {
      const image = d.cover_image_url || d.chapter?.cover_image_url;
      return d.type === "comic" && image ? [toIssue(d, image)] : [];
    }),
  };
});
