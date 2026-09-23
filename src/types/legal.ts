import type { Locale } from "@/lib/utils/locales";

/**
 * A legal page - Terms & Conditions, Privacy Policy - as the team writes it in
 * Decap (`src/content/legal/<locale>/<slug>.md`, read by `src/lib/api/legal.ts`).
 *
 * THE PAGE IS ITS SECTIONS. The frame draws a left nav beside the text, and
 * both come from the same list: each section is one nav item and one block of
 * the document, so adding, removing or reordering a section in the editor
 * moves the nav with it and nothing in code has to be told.
 */
export type LegalSection = {
  /** Anchor, from the nav label. The nav links to it and the spy watches it. */
  id: string;
  /**
   * The short name in the nav. The frame's are shorter than the headings -
   * "Account" for YOUR ACCOUNT, "Payments" for PURCHASES, PAYMENTS, AND
   * PRICING - so a section carries both.
   */
  navLabel: string;
  heading: string;
  /** Markdown: paragraphs, bullets, the odd bold lead-in and mailto link. */
  body: string;
};

export type LegalPage = {
  slug: string;
  locale: Locale;
  title: string;
  /** Just the date - "September 2026". The label beside it is site copy. */
  lastUpdated: string;
  sections: readonly LegalSection[];
};
