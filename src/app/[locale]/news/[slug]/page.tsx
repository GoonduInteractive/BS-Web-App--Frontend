import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ArticleDetail } from "@/components/news/ArticleDetail";
import { JsonLd } from "@/components/chrome/JsonLd";
import { getArticle, getArticleSlugs, getRelatedArticles } from "@/lib/api/news";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { localePath, pageMetadata, SITE_URL, STUDIO_NAME } from "@/lib/seo";

/** One article. */
export function generateStaticParams() {
  const slugs = getArticleSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getArticle(locale, slug).catch(() => null);
  if (!article) return {};
  const messages = getMessages(locale);
  return pageMetadata({
    locale,
    path: `/news/${article.slug}`,
    title: `${article.title} | ${messages.news.meta.title}`,
    description: article.excerpt,
    type: "article",
    published: article.published,
    // The article's own picture as its card. A torn cover is composed on the
    // page, so its card is the picture alone rather than the composition.
    image: article.cover.src,
    imageAlt: article.imageAlt,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const article = await getArticle(locale, slug).catch(() => null);
  if (!article) notFound();

  const messages = getMessages(locale);
  const related = await getRelatedArticles(locale, slug);

  // The article for search engines: what the page's metadata says, with the
  // studio as author and publisher and the same picture as the card.
  const structured = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published,
    inLanguage: locale,
    mainEntityOfPage: new URL(localePath(locale, `/news/${article.slug}`), SITE_URL).toString(),
    image: [new URL(article.cover.src, SITE_URL).toString()],
    author: { "@type": "Organization", name: STUDIO_NAME },
    publisher: { "@id": `${SITE_URL.origin}/#organization` },
  };

  return (
    <main className="bg-roster">
      <JsonLd data={structured} />
      {/* The phone frame opens the chip 184 under the top; the desktop frame 226. */}
      <div className="mx-auto w-full max-w-360 px-6 pt-[11.5rem] pb-24 md:px-20 md:pt-[14.125rem]">
        <ArticleDetail article={article} related={related} messages={messages} locale={locale} />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
