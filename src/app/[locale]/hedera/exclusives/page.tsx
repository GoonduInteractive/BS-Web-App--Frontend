import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { HiddenSection } from "@/components/chrome/HiddenSection";
import { HederaFrame } from "@/components/hedera/HederaFrame";
import { MyExclusives } from "@/components/hedera/MyExclusives";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/** My exclusives (the doc's screen 8). */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).hedera.exclusives.meta;
  return pageMetadata({ locale, path: "/hedera/exclusives", title: t.title, description: t.description, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;
  const t = messages.hedera.exclusives;

  return (
    <HederaFrame messages={messages} locale={locale} art="exclusives" title={t.title} intro={t.intro}>
      <RequireAuth locale={locale}>
        <MyExclusives messages={messages} locale={locale} />
      </RequireAuth>
    </HederaFrame>
  );
}
