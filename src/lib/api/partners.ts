import { cache } from "react";

import { readEntries, type Entry } from "@/lib/content";
import { partnerFrontmatter, type PartnerFrontmatter } from "@/lib/schemas/partner";
import type { Locale } from "@/lib/utils/locales";
import type { Partner } from "@/types/partner";

/**
 * The About page's partner logos, from the CMS.
 *
 * `src/content/partners/<locale>/<slug>.md`, read through `lib/content.ts`
 * like the team, checked against `lib/schemas/partner.ts`. Logos switched off
 * in the editor are left out here. Order is the editor's `order`, then the name.
 */

const COLLECTION = "partners";

function toPartner(locale: Locale, { slug, data }: Entry<PartnerFrontmatter>): Partner {
  return { slug, locale, name: data.name, logo: data.logo, url: data.url, order: data.order };
}

const readList = cache((locale: Locale): readonly Partner[] =>
  readEntries(COLLECTION, locale, partnerFrontmatter)
    .filter((entry) => entry.data.visible)
    .map((entry) => toPartner(locale, entry))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
);

export async function getPartners(locale: Locale): Promise<readonly Partner[]> {
  return readList(locale);
}
