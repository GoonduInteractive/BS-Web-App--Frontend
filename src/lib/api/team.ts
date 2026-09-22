import { cache } from "react";

import { readEntries, type Entry } from "@/lib/content";
import { teamFrontmatter, type TeamFrontmatter } from "@/lib/schemas/team";
import type { Locale } from "@/lib/utils/locales";
import type { TeamMember } from "@/types/team";

/**
 * The About page's team, from the CMS.
 *
 * `src/content/team/<locale>/<slug>.md`, read through `lib/content.ts` with
 * the English underneath the Igbo, checked against `lib/schemas/team.ts`.
 * People switched off in the editor are left out here, so the grid never
 * learns they exist. Order is the editor's `order`, then the name.
 */

const COLLECTION = "team";

function toMember(locale: Locale, { slug, data }: Entry<TeamFrontmatter>): TeamMember {
  return {
    slug,
    locale,
    name: data.name,
    role: data.role,
    image: data.image,
    portraitAlt: data.portraitAlt,
    group: data.group,
    order: data.order,
  };
}

const readList = cache((locale: Locale): readonly TeamMember[] =>
  readEntries(COLLECTION, locale, teamFrontmatter)
    .filter((entry) => entry.data.visible)
    .map((entry) => toMember(locale, entry))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
);

export async function getTeam(locale: Locale): Promise<readonly TeamMember[]> {
  return readList(locale);
}
