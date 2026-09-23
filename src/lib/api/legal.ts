import { cache } from "react";

import { readEntry } from "@/lib/content";
import { legalFrontmatter } from "@/lib/schemas/legal";
import type { Locale } from "@/lib/utils/locales";
import type { LegalPage } from "@/types/legal";

/**
 * The legal pages, from the CMS.
 *
 * `src/content/legal/<locale>/<slug>.md`, read through `lib/content.ts` with
 * the English underneath the Igbo and checked against `lib/schemas/legal.ts`.
 * There are exactly two - `terms` and `privacy` - and the CMS collection is
 * `create: false`, so the team can rewrite them but cannot invent a third or
 * delete one out from under its route.
 */

const COLLECTION = "legal";

export class LegalPageNotFoundError extends Error {
  constructor(slug: string) {
    super(`No legal page for slug "${slug}"`);
    this.name = "LegalPageNotFoundError";
  }
}

/**
 * The anchor for a section, from its nav label: "Your Account" → "your-account".
 * Derived rather than authored so an editor never has to think about anchors,
 * and stable as long as the label is.
 */
function anchor(navLabel: string): string {
  return navLabel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const read = cache((locale: Locale, slug: string): LegalPage | null => {
  const entry = readEntry(COLLECTION, locale, slug, legalFrontmatter);
  if (!entry) return null;
  const { data } = entry;

  return {
    slug,
    locale,
    title: data.title,
    lastUpdated: data.lastUpdated,
    sections: data.sections.map((section) => ({
      id: anchor(section.navLabel),
      navLabel: section.navLabel,
      heading: section.heading,
      body: section.body,
    })),
  };
});

export async function getLegalPage(locale: Locale, slug: string): Promise<LegalPage> {
  const page = read(locale, slug);
  if (!page) throw new LegalPageNotFoundError(slug);
  return page;
}
