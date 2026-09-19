import type { Metadata } from "next";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/utils/locales";

/**
 * One place for the site's metadata. Every route's `generateMetadata` goes
 * through `pageMetadata`, so a canonical, its two language alternates, the
 * Open Graph and Twitter cards and the indexing rule are never written by
 * hand twice and can never drift between pages.
 *
 * THE SITE URL IS AN ENVIRONMENT VARIABLE. Canonicals, hreflang alternates and
 * social images all have to be absolute, and the production host is not this
 * repository's to know. Set `NEXT_PUBLIC_SITE_URL` (no trailing slash) at
 * build time; until it is, everything resolves against localhost, which is
 * right for a dev server and wrong for a deploy. FLAGGED in the notes.
 */
export const SITE_NAME = "Beyond Service: Trial of the Gods";
export const STUDIO_NAME = "Goondu Games";
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

/** The default social card: the key art at 1200 x 630, cut from the delivered `brand/trial-of-the-gods.png`. */
export const OG_IMAGE = { url: "/assets/og/beyond-service.jpg", width: 1200, height: 630 } as const;

/** Open Graph locale tags. Both are Nigerian — the audience is Nigeria-first. */
const OG_LOCALE: Record<Locale, string> = { en: "en_NG", ig: "ig_NG" };

/** `/en/the-game`, `/ig`, and so on — every route lives under a locale. */
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return `/${locale}${clean}`;
}

export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  imageAlt,
  type = "website",
  published,
  noIndex = false,
}: {
  locale: Locale;
  /** The route without its locale: "/", "/the-game", "/news/[slug]" resolved. */
  path: string;
  title: string;
  description?: string;
  /** A page's own card, site-relative. Falls back to the key art. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  /** ISO date, for articles. */
  published?: string;
  /**
   * Keep the page out of search. For the pages that are one visitor's own —
   * their profile, their cart, their checkout — which have nothing to rank.
   */
  noIndex?: boolean;
}): Metadata {
  const url = localePath(locale, path);
  const languages = Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)]));
  const card = image
    ? { url: image, alt: imageAlt ?? title }
    : { url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: imageAlt ?? SITE_NAME };

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ...languages, "x-default": localePath(DEFAULT_LOCALE, path) },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      url,
      title,
      description,
      images: [card],
      ...(type === "article" && published ? { publishedTime: published } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card.url],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * JSON-LD, serialised for a `<script type="application/ld+json">`. `<` is
 * escaped so no string in the data can close the script element.
 */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
