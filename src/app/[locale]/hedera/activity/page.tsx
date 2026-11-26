import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { HiddenSection } from "@/components/chrome/HiddenSection";
import { HederaActivityView } from "@/components/hedera/HederaActivityView";
import { HederaFrame } from "@/components/hedera/HederaFrame";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/** Hedera activity (the doc's screen 14). */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).hedera.activity.meta;
  return pageMetadata({ locale, path: "/hedera/activity", title: t.title, description: t.description, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;
  const t = messages.hedera.activity;

  return (
    <HederaFrame messages={messages} locale={locale} art="activity" title={t.title} intro={t.intro}>
      <RequireAuth locale={locale}>
        <HederaActivityView messages={messages} locale={locale} />
      </RequireAuth>
    </HederaFrame>
  );
}
