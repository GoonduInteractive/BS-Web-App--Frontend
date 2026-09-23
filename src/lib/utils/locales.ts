/**
 * The two shipped locales. i18n is architectural here, not cosmetic - the entry
 * screen's NNOO / WELCOME choice is the language switch (overview section 9).
 *
 * This is a stand-in. When next-intl is wired in chunk 1 it will own routing and
 * this will most likely move to its config.
 */
export const LOCALES = ["en", "ig"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
