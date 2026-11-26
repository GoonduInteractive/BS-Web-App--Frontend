import { cache } from "react";
import { z } from "zod";

import { readEntries } from "@/lib/content";
import type { Locale } from "@/lib/utils/locales";

/**
 * NEWS CATEGORIES, from the CMS (the human, 2026-11-26: editors add their own).
 *
 * Decap's "News categories" collection writes one file per category per
 * locale into `src/content/categories/<locale>/<slug>.md`, each holding the
 * category's `name`. An article's categories are those slugs (Decap's relation
 * widget), so a category an editor adds in /admin is on the site with its
 * next publish - no developer, no deploy of code. The Igbo name is laid over
 * the English (`lib/content.ts`), so a category with no Igbo yet reads in English.
 */

const COLLECTION = "categories";

const category = z.object({ name: z.string().trim().min(1) });

/** Slug → printed name, one map per locale per render. */
export const categoryNames = cache(
  (locale: Locale): ReadonlyMap<string, string> => new Map(readEntries(COLLECTION, locale, category).map((e) => [e.slug, e.data.name])),
);

/**
 * A category's name, or - for one an editor has since deleted - its slug made
 * readable ("game-night" → "Game night"), so an older article still shows it.
 */
export function categoryName(names: ReadonlyMap<string, string>, slug: string): string {
  return names.get(slug) ?? slug.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());
}
