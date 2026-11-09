import { z } from "zod";

import { authedRequest } from "./session";

/**
 * The comics a player owns, as them, in the browser: their library
 * (`/v1/comics`) and a chapter's pages (`/v1/comics/{slug}`), which the API
 * hands only to an owner. The store sells the chapters (`lib/api/merch.ts`).
 */

const library = z.object({
  items: z
    .array(z.object({ chapter: z.object({ product: z.object({ slug: z.string() }).nullish() }).nullish() }))
    .default([]),
});

/** The store slugs of every chapter the player owns. FLAGGED: the first hundred. */
export async function getLibrary(): Promise<ReadonlySet<string>> {
  const { items } = await authedRequest("GET", "/v1/comics?page=1&limit=100", library);
  return new Set(items.flatMap((item) => (item.chapter?.product ? [item.chapter.product.slug] : [])));
}

/** A chapter's pages, in order. Refused (403 or 404) for a player who doesn't own it. */
export async function getComicPages(slug: string): Promise<readonly string[]> {
  const reply = await authedRequest(
    "GET",
    `/v1/comics/${encodeURIComponent(slug)}`,
    z.object({ comic: z.object({ page_urls: z.array(z.string()).default([]) }) }),
  );
  return reply.comic.page_urls;
}
