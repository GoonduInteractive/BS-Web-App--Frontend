import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleCard, ArticleMediaView } from "@/components/news/ArticleCard";
import { TagPills, relativeDate } from "@/components/news/ArticleMeta";
import { ShareArticle } from "@/components/news/ShareArticle";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Article } from "@/types/news";
import type { ComicIssue } from "@/types/merch";

export function ArticleDetail({
  article,
  related,
  comics,
  messages,
  locale,
}: {
  article: Article;
  related: readonly Article[];
  comics: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.news;
  const copy = t.articles[article.copyKey as keyof typeof t.articles];
  const [first, ...rest] = copy.body;
  const above = [first, ...rest.slice(0, 2)].filter(Boolean);
  const below = rest.slice(2);

  return (
    <>
      <Link
        href={`/${locale}/news`}
        className="text-ink font-display focus-visible:outline-signal inline-flex h-8 items-center gap-2 bg-[url('/assets/ornaments/back-chip.svg')] bg-size-[100%_100%] bg-center bg-no-repeat px-4 text-[0.75rem] font-bold tracking-[0.1em] focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <ArrowLeft aria-hidden className="h-3.5 w-3.25 select-none" />
        {t.back}
      </Link>

      <div className="mx-auto grid w-full max-w-[66.9375rem] grid-cols-1 lg:mt-15 lg:grid-cols-[26%_68.8%] lg:justify-between">
        {/* ---- The header: first on the phone; the sticky left column from lg ---- */}
        <header className="mt-[3.875rem] lg:sticky lg:top-[8.5rem] lg:col-start-1 lg:row-start-2 lg:mt-[3.3125rem] lg:self-start">
          <h1 className="font-display text-menu-fg text-[1.9375rem] leading-[1.15] font-semibold tracking-[-0.03em] uppercase">
            {copy.title}
          </h1>

          {/* One row on the phone, stacked from lg — as the two frames draw them. */}
          <div className="mt-5.5 flex flex-wrap items-baseline gap-x-7 gap-y-1.5 lg:block">
            <p className="text-menu-fg/85 font-body text-[0.6875rem] leading-none tracking-[0.06em] uppercase">
              {relativeDate(article.published, messages)}
            </p>
            <p className="text-menu-fg/85 font-body text-body-sm leading-none lg:mt-1.5">{t.byline}</p>
          </div>

          <TagPills tags={article.tags} messages={messages} outline="linen" className="mt-[1.9375rem] lg:mt-5" />
        </header>

        {/* ---- The picture: under the header on the phone; the full-width first row from lg ---- */}
        <div className="relative mt-11.5 aspect-[1071/578] w-full overflow-hidden lg:col-span-2 lg:row-start-1 lg:mt-0">
          <ArticleMediaView article={article} comics={comics} messages={messages} alt={copy.imageAlt} priority />
        </div>

        {/* ---- The body ---- */}
        <div className="mt-9.5 lg:col-start-2 lg:row-start-2 lg:mt-[3.3125rem]">
          {above.map((paragraph, i) => (
            <p
              key={`a-${i}`}
              className={`text-menu-fg/85 font-body text-body-sm leading-[1.4375rem] ${i ? "mt-6" : ""}`}
            >
              {paragraph}
            </p>
          ))}

          {article.bodyMedia ? (
            <div className="relative mt-11.5 aspect-[737/348] w-full overflow-hidden">
              <ArticleMediaView article={article} comics={comics} messages={messages} alt={copy.imageAlt} body />
            </div>
          ) : null}

          {below.map((paragraph, i) => (
            <p
              key={`b-${i}`}
              className={`text-menu-fg/85 font-body text-body-sm leading-[1.4375rem] ${i ? "mt-6" : "mt-11.5"}`}
            >
              {paragraph}
            </p>
          ))}

          <ShareArticle title={copy.title} messages={messages} className="mt-20 lg:mt-[5.375rem]" />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="pt-[9.25rem] lg:pt-[16.4375rem]">
          <h2 className="font-display text-menu-fg text-[2.25rem] leading-none font-semibold tracking-[-0.03em] uppercase">
            {t.more}
          </h2>

          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:mt-[2.75rem] lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ArticleCard article={item} comics={comics} messages={messages} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
