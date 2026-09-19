/**
 * A news article.
 *
 * Contracts live here so the components never learn where an article came from.
 * Today it is a mock adapter; the project's plan is Decap CMS writing markdown
 * into `src/content/news/`, and when that lands only `src/lib/api/news.ts`
 * changes.
 */

/** Keys into `messages.news.tags`. The frame draws two. */
export type ArticleTag = "news" | "announcement";

/**
 * How an article's lead image is produced.
 *
 * Most are photographs or renders. One is a COMIC COVER — the frame's
 * "Registration opens for the Eastern Province Cup" card carries the Between
 * Worlds cover, which this site composes rather than loads, so that card renders
 * `ComicCover` instead of an `<Image>`.
 */
export type ArticleMedia =
  | { kind: "image"; src: string }
  | { kind: "comic"; slug: string };

export type Article = {
  slug: string;
  /** Key into `messages.news.articles`. */
  copyKey: string;
  media: ArticleMedia;
  tags: readonly ArticleTag[];
  /** ISO date. Rendered relative — "5 DAYS AGO" — in the reader's locale. */
  published: string;
  /** A second image partway down the detail page, as the frame draws one. */
  bodyMedia?: ArticleMedia;
};
