import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { HiddenSection } from "@/components/chrome/HiddenSection";
import { HederaFrame } from "@/components/hedera/HederaFrame";
import { Hub } from "@/components/hedera/Hub";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/** The Hedera hub (the doc's screen 2). One player's own: read in the browser. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).hedera.hub.meta;
  return pageMetadata({ locale, path: "/hedera/hub", title: t.title, description: t.description, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;

  return (
    <HederaFrame messages={messages} locale={locale} art="hub" title={messages.hedera.hub.title}>
      <RequireAuth locale={locale}>
        <Hub messages={messages} locale={locale} />
      </RequireAuth>
    </HederaFrame>
  );
}
