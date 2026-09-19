import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ExploreComics, FeaturedComic } from "@/components/comics/FeaturedComic";
import { OwnTheStory } from "@/components/comics/OwnTheStory";
import { getComics } from "@/lib/api/merch";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/**
 * The Comics. Figma: `context/design/09-comics/One Comics.png` and
 * `More than one comic.png`.
 *
 * ONE PAGE, TWO FRAMES, AND THE DIFFERENCE IS THE DATA. The second frame adds
 * EXPLORE MORE COMICS between the featured issue and the OWN THE STORY band.
 * That section appears when there is more than one issue and is absent when
 * there is not — no flag, and the single-comic frame is simply what one issue
 * looks like.
 *
 * THE GROUND IS THE GRADIENT THE HUMAN SUPPLIED — `180deg, #170303, #010101`,
 * which is `--color-roster-top` to `--color-roster-bottom`, already in `@theme`
 * as the `bg-roster` utility. No new token.
 *
 * The comics themselves come from the same adapter the merch store reads, so an
 * issue is one record with one cover wherever it appears.
 */
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
  const t = getMessages(locale).comics.meta;
  return pageMetadata({ locale, path: "/comics", title: t.title, description: t.description });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  // Not public yet — the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("comics")) return <HiddenSection section="comics" locale={locale} messages={messages} />;

  const comics = await getComics();
  const [featured] = comics;

  // The frame's grid is eight cards from the issues there are, repeating — the
  // same repetition the merch grid and the About team grid use.
  const explore =
    comics.length > 1 ? Array.from({ length: 8 }, (_, i) => comics[i % comics.length]) : [];

  return (
    <main className="bg-roster">
      <div className="mx-auto w-full max-w-360 px-6 pt-28 md:px-20 md:pt-[13rem]">
        <header className="text-center">
          <p className="font-display text-menu-fg text-[1.375rem] leading-none font-bold tracking-[-0.05em] uppercase">
            {messages.comics.overline}
          </p>
          <h1 className="font-display text-menu-fg mt-1 text-[4rem] leading-none font-semibold tracking-[-0.077em] uppercase md:text-[6.25rem]">
            {messages.comics.title}
          </h1>
          <p className="text-menu-fg/85 font-body text-body-sm mx-auto mt-2.75 max-w-[24rem] leading-[1.5rem]">
            {messages.comics.subtitle}
          </p>
        </header>

        {featured ? (
          <div className={explore.length > 0 ? "mt-24 md:mt-50" : "mt-24 pb-28 md:mt-50 md:pb-[18.8125rem]"}>
            <FeaturedComic issue={featured} messages={messages} locale={locale} />
          </div>
        ) : null}

        {explore.length > 0 ? (
          <ExploreComics issues={explore} messages={messages} locale={locale} />
        ) : null}
      </div>

      <OwnTheStory
        messages={messages}
        href={featured ? `/${locale}/merch/comics/${featured.slug}` : `/${locale}/merch`}
      />

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
