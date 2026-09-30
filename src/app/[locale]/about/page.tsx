import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutHero } from "@/components/about/AboutHero";
import { StudioStory } from "@/components/about/StudioStory";
import { PartnersSection } from "@/components/about/PartnersSection";
import { TeamSection } from "@/components/about/TeamSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { getPartners } from "@/lib/api/partners";
import { getTeam } from "@/lib/api/team";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = getMessages(locale).about.meta;
  return pageMetadata({ locale, path: "/about", title: t.title, description: t.description });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const [team, partners] = await Promise.all([getTeam(locale), getPartners(locale)]);

  return (
    <main>
      <AboutHero messages={messages} />
      <StudioStory messages={messages} />
      <TeamSection members={team} messages={messages} />
      <PartnersSection partners={partners} messages={messages} />

      <div className="pt-37.25">
        <SiteFooter messages={messages} locale={locale} />
      </div>
    </main>
  );
}
