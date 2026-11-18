import { z } from "zod";

import { authedKeepalive, authedRequest } from "./session";

/**
 * The comics a player owns, as them, in the browser: their library
 * (`/v1/comics`) and a chapter's pages (`/v1/comics/{slug}`), which the API
 * hands only to an owner. The store sells the chapters (`lib/api/merch.ts`).
 *
 * And what reading earns: progress reports (`/v1/comics/{chapter_id}/progress`)
 * and the player's share link (`/v1/comics/{chapter_id}/share`). Those two are
 * filed under the chapter's id, not its store slug.
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

const progressReply = z.object({ completed: z.boolean().default(false), seeds_earned: z.coerce.number().default(0) });

/**
 * Reading, reported as it happens (`useReadingProgress`): the furthest page
 * reached, 1-based, and the seconds actually spent reading since the last
 * report. The API pays Seeds for a chapter read through; `seedsEarned` is
 * what this report earned.
 */
export async function reportReading(
  chapterId: string,
  progress: { page: number; seconds: number },
): Promise<{ completed: boolean; seedsEarned: number }> {
  const reply = await authedRequest("POST", `/v1/comics/${encodeURIComponent(chapterId)}/progress`, progressReply, progress);
  return { completed: reply.completed, seedsEarned: reply.seeds_earned };
}

/** The same report as the reader leaves the tab: sent so it survives the page closing, unanswered. */
export function reportReadingOnLeave(chapterId: string, progress: { page: number; seconds: number }): void {
  authedKeepalive("POST", `/v1/comics/${encodeURIComponent(chapterId)}/progress`, progress);
}

/**
 * The player's own link to a chapter. A reader who arrives through it earns
 * them Seeds, so the share marks send it in place of the page's address.
 */
export async function getShareLink(chapterId: string): Promise<string> {
  const { share_url } = await authedRequest(
    "POST",
    `/v1/comics/${encodeURIComponent(chapterId)}/share`,
    z.object({ share_url: z.string().min(1) }),
  );
  return share_url;
}
