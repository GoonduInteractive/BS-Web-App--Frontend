import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ArticleCard } from "@/components/news/ArticleCard";
import { LoadMore } from "@/components/news/LoadMore";
import { getComics } from "@/lib/api/merch";
import { getFeatured, getMoreNews } from "@/lib/api/news";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).news.meta;
  return pageMetadata({ locale, path: "/news", title: t.title, description: t.description });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const [{ lead, beside }, more, comics] = await Promise.all([
    getFeatured(),
    getMoreNews(),
    getComics(),
  ]);

  return (
    <main className="bg-roster">
      <div className="mx-auto w-full max-w-360 px-6 pt-28 pb-24 md:px-20 md:pt-65.5">
        <header className="text-center">
          <h1 className="font-display text-menu-fg text-[6.75rem] leading-[0.9] font-semibold tracking-[-0.045em] uppercase">
            {messages.news.title}
          </h1>
          <p className="text-menu-fg/85 font-body text-body-sm leading-none">
            {messages.news.subtitle}
          </p>
        </header>

        {/* The lead block: one large article, two beside it. */}
        <div className="mt-16 grid grid-cols-1 gap-10 lg:mt-28.75 lg:grid-cols-[57.4%_40.5%] lg:justify-between lg:gap-0">
          <ArticleCard
            article={lead}
            comics={comics}
            messages={messages}
            locale={locale}
            size="lead"
            priority
          />

          <div className="flex flex-col gap-11.75">
            {beside.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                comics={comics}
                messages={messages}
                locale={locale}
                size="wide"
              />
            ))}
          </div>
        </div>

        <section className="pt-20 md:pt-28.25">
          <h2 className="font-display text-menu-fg text-[2.25rem] leading-none font-semibold tracking-[-0.03em] uppercase">
            {messages.news.more}
          </h2>

          <LoadMore
            articles={more}
            comics={comics}
            messages={messages}
            locale={locale}
          />
        </section>
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
