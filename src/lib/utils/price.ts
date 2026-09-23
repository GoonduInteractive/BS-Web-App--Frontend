import type { Locale } from "./locales";

/**
 * Naira, grouped, with the symbol from the message file rather than the locale
 * data - `Intl` renders NGN as "NGN" or "₦" depending on the runtime's ICU
 * build, and the frames are unambiguous about wanting ₦.
 *
 * The number is grouped per locale; the symbol's position is the message's.
 */
export function formatPrice(amount: number, locale: Locale, pattern: string): string {
  const grouped = new Intl.NumberFormat(locale === "ig" ? "en-NG" : "en-NG").format(amount);
  return pattern.replace("{amount}", grouped);
}
