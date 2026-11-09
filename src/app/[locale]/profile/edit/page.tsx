import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { getSignUpRegions } from "@/lib/api/regions";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/** Location's region list comes from the API: rebuilt at most hourly, as Create Account is. */
export const revalidate = 3600;

/** Edit profile. Figma: `context/design/12-player-profile/Edit profile.png`. */
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
  const t = getMessages(locale).profile;
  return pageMetadata({ locale, path: "/profile/edit", title: `${t.form.title} | ${t.meta.title}`, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const regions = await getSignUpRegions();

  return (
    <main className="bg-roster min-h-dvh">
      <div className="mx-auto w-full max-w-360 px-6 pt-28 pb-24 md:px-20 md:pt-[11.5625rem]">
        <RequireAuth locale={locale}>
          <EditProfileForm regions={regions} messages={messages} locale={locale} />
        </RequireAuth>
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
