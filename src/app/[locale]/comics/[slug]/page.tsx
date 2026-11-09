import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ComicReader } from "@/components/comics/ComicReader";
import { ShareComic } from "@/components/comics/ShareComic";
import { SummonsSection } from "@/components/game/SummonsSection";
import { ComicCover } from "@/components/merch/ComicCover";
import { getComic, getComics, getRelatedComics } from "@/lib/api/merch";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { comicLabel } from "@/lib/utils/comic-sales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/** The catalogue is the API's: rebuilt at most hourly. */
export const revalidate = 3600;

/**
 * A reader for every chapter: the pages are the owner's to read
 * (`ComicReader`), not the page's to carry.
 */
export async function generateStaticParams() {
  const comics = await getComics();
  return LOCALES.flatMap((locale) =>
    comics.map((c) => ({ locale, slug: c.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const issue = await getComic(slug).catch(() => null);
  if (!issue) return {};
  const messages = getMessages(locale);
  const copy = issue.copy;
  return pageMetadata({
    locale,
    path: `/comics/${issue.slug}`,
    title: `${copy.title} | ${messages.comics.meta.title}`,
    description: copy.description || messages.comics.meta.description,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const issue = await getComic(slug).catch(() => null);
  if (!issue) notFound();

  const messages = getMessages(locale);
  // Not public yet - the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("comics")) return <HiddenSection section="comics" locale={locale} messages={messages} />;

  const related = await getRelatedComics(slug);
  const copy = issue.copy;

  return (
    <main className="bg-roster">
      <ComicReader issue={issue} title={copy.title} messages={messages} locale={locale} />

      <div className="pt-2.75 md:pt-20.5">
        <ShareComic title={copy.title} messages={messages} />
      </div>

      {related.length > 0 ? (
        <div className="mx-auto w-full max-w-360 px-5 pt-35.25 md:px-20 md:pt-47.25">

          <ul className="grid grid-cols-1 gap-x-7.25 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, i) => {
              const itemCopy = item.copy;
              return (
                <li key={`${item.slug}-${i}`}>
                  <Link
                    href={`/${locale}/merch/comics/${item.slug}`}
                    className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    <ComicCover issue={item} messages={messages} size="mini" />
                    <h2 className="font-display text-menu-fg mt-4.25 text-h5 leading-none font-semibold tracking-[-0.03em] uppercase">
                      {itemCopy.title}
                    </h2>
                    <p className="text-menu-fg/85 font-body text-body-sm mt-2.5 leading-none">
                      {comicLabel(item, messages)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* The same section The Game page closes on, reused rather than rebuilt.
          No scroll cue here: the frame ends on the footer. */}
      <SummonsSection messages={messages} variant="comics" />

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
