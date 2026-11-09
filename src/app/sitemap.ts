import type { MetadataRoute } from "next";

import { getComics, getProducts } from "@/lib/api/merch";
import { getCharacters } from "@/lib/api/characters";
import { getArticles } from "@/lib/api/news";
import { getTournamentSlugs } from "@/lib/api/tournaments";
import { GATES } from "@/lib/gates";
import { hiddenSectionOf } from "@/lib/hidden-sections";
import { localePath, SITE_URL } from "@/lib/seo";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/utils/locales";

/**
 * `/sitemap.xml`: every public route in both locales, each entry carrying its
 * language alternates, read from the same adapters and manifests the routes
 * themselves prerender from - so a new article, product or tournament is in
 * the sitemap the moment it is on the site, and when the CMS replaces an
 * adapter the sitemap follows without a change here.
 *
 * Left out, deliberately: the profile, the cart and the checkout (one
 * visitor's own; also `noindex`), comics with no pages (they 404), and every
 * route in a section the public may not see yet (`lib/hidden-sections.ts` -
 * they are the Coming Soon page for now, and `noindex`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, characters, products, comics, tournaments] = await Promise.all([
    // An entry exists when its English file does; the path is the same in both locales.
    getArticles(DEFAULT_LOCALE),
    getCharacters(DEFAULT_LOCALE),
    getProducts(),
    getComics(),
    getTournamentSlugs(),
  ]);

  const paths: { path: string; priority: number; lastModified?: string }[] = [
    { path: "/", priority: 1 },
    ...GATES.map((gate) => ({ path: `/${gate.slug}`, priority: 0.9 })),
    { path: "/about", priority: 0.7 },
    { path: "/terms", priority: 0.3 },
    { path: "/privacy", priority: 0.3 },
    { path: "/news", priority: 0.8 },
    { path: "/comics", priority: 0.7 },
    { path: "/merch", priority: 0.7 },
    ...characters.map((c) => ({ path: `/characters/${c.slug}`, priority: 0.8 })),
    ...articles.map((a) => ({ path: `/news/${a.slug}`, priority: 0.6, lastModified: a.published })),
    ...comics.map((c) => ({ path: `/merch/comics/${c.slug}`, priority: 0.5 })),
    ...products.map((p) => ({ path: `/merch/${p.slug}`, priority: 0.5 })),
    ...tournaments.map((slug) => ({ path: `/competition/${slug}`, priority: 0.7 })),
  ];

  const absolute = (p: string) => new URL(p, SITE_URL).toString();

  return paths.filter(({ path }) => hiddenSectionOf(path) === null).flatMap(({ path, priority, lastModified }) =>
    LOCALES.map((locale) => ({
      url: absolute(localePath(locale, path)),
      priority,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, absolute(localePath(l, path))])),
      },
    })),
  );
}
