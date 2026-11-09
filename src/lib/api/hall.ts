import { cache } from "react";

import { readEntries, type Entry } from "@/lib/content";
import { hallFrontmatter, type HallFrontmatter } from "@/lib/schemas/hall";
import type { Locale } from "@/lib/utils/locales";
import type { HallEntry } from "@/types/hall";

/**
 * The hall's champions, from the CMS (human, 2026-10-15).
 *
 * `src/content/hall/<locale>/<slug>.md`, read through `lib/content.ts` like
 * the partners, checked against `lib/schemas/hall.ts`. Cards switched off in
 * the editor are left out here. Order is the season, then the handle.
 */

const COLLECTION = "hall";

function toEntry({ slug, data }: Entry<HallFrontmatter>): HallEntry {
  return { slug, handle: data.handle, season: data.season, tournament: data.tournament, portrait: data.portrait };
}

const readList = cache((locale: Locale): readonly HallEntry[] =>
  readEntries(COLLECTION, locale, hallFrontmatter)
    .filter((entry) => entry.data.visible)
    .map(toEntry)
    .sort((a, b) => a.season - b.season || a.handle.localeCompare(b.handle)),
);

export async function getHallOfAscension(locale: Locale): Promise<readonly HallEntry[]> {
  return readList(locale);
}
