import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { getProfile } from "@/lib/api/profile";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/**
 * The player profile. Figma: `context/design/12-player-profile/`.
 *
 * Both profile frames are this one route: `getProfile()` decides whether the
 * player is in a tournament, and the card renders the state the data describes.
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
  const t = getMessages(locale).profile.meta;
  return pageMetadata({ locale, path: "/profile", title: t.title, description: t.description, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const profile = await getProfile();

  return (
    <main className="bg-roster min-h-dvh">
      <div className="mx-auto w-full max-w-360 px-6 pt-28 pb-24 md:px-20 md:pt-[11.5625rem]">
        <ProfileCard profile={profile} messages={messages} locale={locale} />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
