import type { Locale } from "@/lib/utils/locales";

/**
 * One person on the About page's team grid, as the content team writes them in
 * Decap (`src/content/team/<locale>/<slug>.md`, read by `src/lib/api/team.ts`).
 * The copy — role, portrait description — is inside the entry, one file per
 * locale; the name and the picture are the same in both.
 *
 * How a portrait is cropped into its card is NOT here: that is solved per
 * picture file and lives in `src/lib/team.ts`, keyed by the file.
 */
/**
 * Which tab a person appears under on the About page — the tab order, too.
 * The human named Core Team and Contributors, then Partners (2026-09-22).
 * Adding another is this list, a label in `messages.about.team.tabs`, and the
 * option in the CMS select; nothing else knows how many there are.
 */
export const TEAM_GROUPS = ["core", "contributors", "partners"] as const;
export type TeamGroup = (typeof TEAM_GROUPS)[number];

export type TeamMember = {
  slug: string;
  locale: Locale;
  /** As it appears on the card, e.g. MICHAEL APELI. */
  name: string;
  role: string;
  image: string;
  portraitAlt: string;
  group: TeamGroup;
  /** Position in the grid. Lower comes first. */
  order: number;
};
