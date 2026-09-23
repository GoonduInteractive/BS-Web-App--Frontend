import { cache } from "react";

import { contentSlugs, readEntries, type Entry } from "@/lib/content";
import { articleFrontmatter, type ArticleFrontmatter } from "@/lib/schemas/news";
import type { Locale } from "@/lib/utils/locales";
import type { Article, ArticleCover } from "@/types/news";

/**
 * News, from the CMS.
 *
 * Decap writes one markdown file per article per locale into
 * `src/content/news/<locale>/<slug>.md`; `lib/content.ts` reads them at build
 * - every news route is statically generated - with the English underneath
 * the Igbo, and `lib/schemas/news.ts` says what the frontmatter must hold.
 * This file only turns an entry into an `Article`. Nothing above it knows the
 * articles are files.
 *
 * NOTHING IS CACHED ACROSS REQUESTS. `cache()` dedupes the reads within one
 * render; a module-level cache held the dev server's first (empty) answer for
 * the rest of its life, which is why an article published locally did not
 * appear until a restart.
 */

const COLLECTION = "news";

export class ArticleNotFoundError extends Error {
  constructor(slug: string) {
    super(`No article for slug "${slug}"`);
    this.name = "ArticleNotFoundError";
  }
}

function toArticle(locale: Locale, { slug, data: fm, body }: Entry<ArticleFrontmatter>): Article {
  const cover: ArticleCover =
    fm.coverStyle === "torn"
      ? { kind: "torn", src: fm.image, band: fm.band, volume: fm.volume, title: fm.coverTitle ?? fm.title }
      : { kind: "image", src: fm.image };

  return {
    slug,
    locale,
    title: fm.title,
    excerpt: fm.excerpt,
    imageAlt: fm.imageAlt,
    author: fm.author,
    cover,
    bodyImage: fm.bodyImage,
    body,
    tags: fm.tags,
    published: fm.published,
  };
}

/** Every slug, from the English folder. Empty when nothing has been published. */
export function getArticleSlugs(): readonly string[] {
  return contentSlugs(COLLECTION);
}

/** One list per locale per render. Newest first, then by slug for a stable order. */
const readList = cache((locale: Locale): readonly Article[] =>
  readEntries(COLLECTION, locale, articleFrontmatter)
    .map((entry) => toArticle(locale, entry))
    .sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug)),
);

export async function getArticles(locale: Locale): Promise<readonly Article[]> {
  return readList(locale);
}

export async function getArticle(locale: Locale, slug: string): Promise<Article> {
  const article = readList(locale).find((a) => a.slug === slug);
  if (!article) throw new ArticleNotFoundError(slug);
  return article;
}

/**
 * The index's lead block: the newest article and the two after it, as the
 * frame lays them out. `lead` is null until something is published.
 */
export async function getFeatured(locale: Locale): Promise<{ lead: Article | null; beside: readonly Article[] }> {
  const articles = readList(locale);
  return { lead: articles[0] ?? null, beside: articles.slice(1, 3) };
}

/** Everything the lead block did not use. */
export async function getMoreNews(locale: Locale): Promise<readonly Article[]> {
  return readList(locale).slice(3);
}

/** The detail page's row. Never includes the article being read. */
export async function getRelatedArticles(locale: Locale, slug: string): Promise<readonly Article[]> {
  return readList(locale)
    .filter((a) => a.slug !== slug)
    .slice(0, 3);
}
