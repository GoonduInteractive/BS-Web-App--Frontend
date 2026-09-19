import type { Article } from "@/types/news";

/**
 * News, from a mock adapter.
 *
 * NO CMS YET. The plan (overview section 9) is Decap writing markdown into
 * `src/content/news/`; until then this returns a fixed list. Components read it
 * through these functions and never learn the difference, so the swap is one
 * file.
 *
 * ⚠ THE COPY IS THE FRAME'S PLACEHOLDER AND CANNOT SHIP. Every excerpt and body
 * paragraph in `context/design/08-news/` is filler lifted from a Call of Duty
 * page — it names `Modern Warfare®`, `Call of Duty®` and `Warzone™`, which are
 * another publisher's trademarks. It is transcribed rather than invented,
 * because copy is never invented here, but Goondu must replace it before this
 * page is public. The article TITLES are Goondu's own and are real.
 */

const ARTICLES: readonly Article[] = [
  {
    slug: "season-one-begins",
    copyKey: "seasonOne",
    media: { kind: "image", src: "/assets/news/news-1.png" },
    tags: ["news", "announcement"],
    published: "2026-09-05",
    bodyMedia: { kind: "image", src: "/assets/news/news-1.png" },
  },
  {
    slug: "between-worlds-explained",
    copyKey: "betweenWorlds",
    media: { kind: "image", src: "/assets/news/news-2.png" },
    tags: ["news", "announcement"],
    published: "2026-09-05",
    bodyMedia: { kind: "image", src: "/assets/news/news-1.png" },
  },
  {
    slug: "eastern-province-cup",
    copyKey: "easternCup",
    // The frame gives this one the Between Worlds cover, which this site
    // composes rather than loads.
    media: { kind: "comic", slug: "between-worlds" },
    tags: ["news", "announcement"],
    published: "2026-09-05",
  },
  {
    slug: "combat-update-1-1",
    copyKey: "combatUpdate",
    media: { kind: "comic", slug: "between-worlds" },
    tags: ["news", "announcement"],
    published: "2026-09-05",
  },
  {
    slug: "fall-of-nze-ugwuoke",
    copyKey: "fallOfNze",
    media: { kind: "image", src: "/assets/news/news-1.png" },
    tags: ["news", "announcement"],
    published: "2026-09-05",
  },
  {
    slug: "trial-of-the-gods-launch",
    copyKey: "trialLaunch",
    media: { kind: "image", src: "/assets/news/news-3.png" },
    tags: ["news", "announcement"],
    published: "2026-09-05",
    bodyMedia: { kind: "image", src: "/assets/news/news-1.png" },
  },
  {
    slug: "trial-of-the-gods-launch-2",
    copyKey: "trialLaunch",
    media: { kind: "image", src: "/assets/news/news-1.png" },
    tags: ["news", "announcement"],
    published: "2026-09-05",
  },
  {
    slug: "trial-of-the-gods-launch-3",
    copyKey: "trialLaunch",
    media: { kind: "image", src: "/assets/news/news-3.png" },
    tags: ["news", "announcement"],
    published: "2026-09-05",
  },
  {
    slug: "season-one-begins-2",
    copyKey: "seasonOne",
    media: { kind: "image", src: "/assets/news/news-1.png" },
    tags: ["news", "announcement"],
    published: "2026-09-04",
  },
  {
    slug: "between-worlds-explained-2",
    copyKey: "betweenWorlds",
    media: { kind: "image", src: "/assets/news/news-2.png" },
    tags: ["news", "announcement"],
    published: "2026-09-04",
  },
  {
    slug: "combat-update-1-1-b",
    copyKey: "combatUpdate",
    media: { kind: "comic", slug: "between-worlds" },
    tags: ["news", "announcement"],
    published: "2026-09-04",
  },
] as const;

export class ArticleNotFoundError extends Error {
  constructor(slug: string) {
    super(`No article for slug "${slug}"`);
    this.name = "ArticleNotFoundError";
  }
}

export async function getArticles(): Promise<readonly Article[]> {
  return ARTICLES;
}

export async function getArticle(slug: string): Promise<Article> {
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) throw new ArticleNotFoundError(slug);
  return article;
}

/**
 * The index's lead block: one large article and two beside it, as the frame
 * lays them out.
 */
export async function getFeatured(): Promise<{
  lead: Article;
  beside: readonly Article[];
}> {
  return { lead: ARTICLES[0], beside: ARTICLES.slice(1, 3) };
}

/** Everything the lead block did not use. */
export async function getMoreNews(): Promise<readonly Article[]> {
  return ARTICLES.slice(3);
}

/** The detail page's row. Never includes the article being read. */
export async function getRelatedArticles(slug: string): Promise<readonly Article[]> {
  return ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);
}
