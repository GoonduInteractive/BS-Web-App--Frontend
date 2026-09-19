import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { CartButton } from "@/components/merch/CartButton";
import { ComicDetail } from "@/components/merch/ComicDetail";
import { getComic, getComics, getRelatedComics } from "@/lib/api/merch";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/**
 * One comic issue. Figma: `Merch Store- Comics Detail.png`.
 */
export async function generateStaticParams() {
  const comics = await getComics();
  return LOCALES.flatMap((locale) => comics.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const messages = getMessages(locale);
  const issue = await getComic(slug).catch(() => null);
  if (!issue) return {};
  const copy = messages.merch.comics.issues[issue.copyKey as keyof typeof messages.merch.comics.issues];
  return pageMetadata({
    locale,
    path: `/merch/comics/${issue.slug}`,
    title: `${copy.title} | ${messages.merch.meta.title}`,
    description: copy.description || messages.merch.meta.description,
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
  // Not public yet — the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("merch")) return <HiddenSection section="merch" locale={locale} messages={messages} />;

  const related = await getRelatedComics(slug);

  return (
    <main>
      <div className="mx-auto w-full max-w-360 px-6 pt-28 md:px-7 md:pt-34.5">
        <div className="flex justify-end">
          <CartButton messages={messages} locale={locale} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-360 px-6 md:mt-2 md:px-20">
        <ComicDetail issue={issue} related={related} messages={messages} locale={locale} />
        <div className="h-24 md:h-[3.125rem]" />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
