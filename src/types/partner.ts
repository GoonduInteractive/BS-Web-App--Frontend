import type { Locale } from "@/lib/utils/locales";

/**
 * One logo in the About page's PARTNERS row, as the content team writes it in
 * Decap (`src/content/partners/<locale>/<slug>.md`, read by
 * `src/lib/api/partners.ts`). Its own collection since 2026-09-28 - partners
 * were a tab of the team before, and the human moved them out into a band of
 * their own under it.
 */
export type Partner = {
  slug: string;
  locale: Locale;
  /** The partner's name; the logo's alt text too. */
  name: string;
  logo: string;
  /** Where the logo links, when the editor gave one. */
  url?: string;
  /** Position in the row. Lower comes first. */
  order: number;
};
