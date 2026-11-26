import localFont from "next/font/local";

/**
 * THE SITE'S HANDWRITING: the community wall's notes, and the torn notes on the
 * About page's team cards (2026-11-26). Bradley Hand ITC, from the file the
 * human dropped in (`src/app/fonts/`, so Next bundles and hashes it rather than
 * serving the raw TTF). One definition for both pages.
 *
 * A page puts `handFont.variable` on the part that uses it, which sets
 * `--font-bradley`; `--font-hand` in globals.css reads it. Not preloaded, and a
 * browser only fetches a face when text is drawn in it, so a page pays the
 * ~160KB only when a note shows.
 *
 * LICENCE - FLAGGED. Bradley Hand ITC is a Monotype face, not an open one like
 * Teko and Host Grotesk. Serving it from the site is web-font embedding and
 * needs a licence that covers it. A one-line swap to a Google face (Kalam is
 * the nearest) is the alternative if none is bought.
 */
export const handFont = localFont({
  src: "../app/fonts/BRADHI.ttf",
  variable: "--font-bradley",
  display: "swap",
  preload: false,
});
