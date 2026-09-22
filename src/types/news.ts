import type { Locale } from "@/lib/utils/locales";

/**
 * A news article, as the content team writes it in Decap.
 *
 * Contracts live here so the components never learn where an article came
 * from. Since 2026-09-21 the source is `src/content/news/<locale>/<slug>.md`,
 * read by `src/lib/api/news.ts` at build; the copy is INSIDE the article — one
 * file per locale — rather than a key into `src/messages`, because an editor
 * writes it, not a developer.
 */

/** Keys into `messages.news.tags`. The frame draws two. */
export type ArticleTag = "news" | "announcement";

/**
 * The band colours an admin may choose for a torn cover. These are the names
 * of `--color-*` tokens in `globals.css`, never hex — the site's palette is
 * the palette. The classes each one maps to are in `components/news/bands.ts`.
 */
export const BAND_COLOURS = [
  "dusk",
  "clot",
  "ember",
  "oxblood",
  "blood",
  "carmine",
  "crimson",
  "menu",
  "abyss",
  "ash",
] as const;

export type BandColour = (typeof BAND_COLOURS)[number];

/**
 * How an article's cover is drawn, the admin's choice per article.
 *
 *   "image"  the photograph or render, full bleed.
 *   "torn"   the frame's banner: a coloured band on the left carrying a volume
 *            tag, a title and the author line, its right edge torn, and the
 *            picture beside it. `title` falls back to the article's own title
 *            when the editor leaves the cover title empty, `volume` is simply
 *            absent when not written, and the author comes from the article
 *            rather than the cover — it is the byline too.
 */
export type ArticleCover =
  | { kind: "image"; src: string }
  | { kind: "torn"; src: string; band: BandColour; volume?: string; title: string };

export type Article = {
  slug: string;
  locale: Locale;
  title: string;
  /** The card's clipped paragraph, and the page description. */
  excerpt: string;
  imageAlt: string;
  /**
   * Who wrote it. The byline on the detail page and, on a torn cover, the line
   * at the foot of the band. Absent falls back to `messages.news.byline`.
   */
  author?: string;
  cover: ArticleCover;
  /** A second picture partway down the detail page, as the frame draws one. */
  bodyImage?: string;
  /** Markdown, as the editor wrote it. */
  body: string;
  tags: readonly ArticleTag[];
  /** ISO date. Rendered relative — "5 DAYS AGO" — in the reader's locale. */
  published: string;
};
