import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ArticleDetail } from "@/components/news/ArticleDetail";
import { JsonLd } from "@/components/chrome/JsonLd";
import { getComics } from "@/lib/api/merch";
import { getArticle, getArticles, getRelatedArticles } from "@/lib/api/news";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { localePath, pageMetadata, SITE_URL, STUDIO_NAME } from "@/lib/seo";

/** One article.News Detail */
export async function generateStaticParams() {
  const articles = await getArticles();
  return LOCALES.flatMap((locale) => articles.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getArticle(slug).catch(() => null);
  if (!article) return {};
  const messages = getMessages(locale);
  const copy = messages.news.articles[article.copyKey as keyof typeof messages.news.articles];
  return pageMetadata({
    locale,
    path: `/news/${article.slug}`,
    title: `${copy.title} | ${messages.news.meta.title}`,
    description: copy.excerpt,
    type: "article",
    published: article.published,
    // The article's own picture as its card; a comic-backed card is composed
    // on the page and has no file, so it takes the key art.
    image: article.media.kind === "image" ? article.media.src : undefined,
    imageAlt: copy.title,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const article = await getArticle(slug).catch(() => null);
  if (!article) notFound();

  const messages = getMessages(locale);
  // Not public yet — the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("news")) return <HiddenSection section="news" locale={locale} messages={messages} />;

  const [related, comics] = await Promise.all([getRelatedArticles(slug), getComics()]);
  const copy = messages.news.articles[article.copyKey as keyof typeof messages.news.articles];

  // The article for search engines: what the page's metadata says, with the
  // studio as author and publisher and the same picture as the card.
  const structured = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: copy.title,
    description: copy.excerpt,
    datePublished: article.published,
    inLanguage: locale,
    mainEntityOfPage: new URL(localePath(locale, `/news/${article.slug}`), SITE_URL).toString(),
    ...(article.media.kind === "image" ? { image: [new URL(article.media.src, SITE_URL).toString()] } : {}),
    author: { "@type": "Organization", name: STUDIO_NAME },
    publisher: { "@id": `${SITE_URL.origin}/#organization` },
  };

  return (
    <main className="bg-roster">
      <JsonLd data={structured} />
      {/* The phone frame opens the chip 184 under the top; the desktop frame 226. */}
      <div className="mx-auto w-full max-w-360 px-6 pt-[11.5rem] pb-24 md:px-20 md:pt-[14.125rem]">
        <ArticleDetail
          article={article}
          related={related}
          comics={comics}
          messages={messages}
          locale={locale}
        />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
