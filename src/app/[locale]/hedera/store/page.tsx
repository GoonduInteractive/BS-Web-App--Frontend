import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { HederaFrame } from "@/components/hedera/HederaFrame";
import { StoreView } from "@/components/hedera/StoreView";
import { getCatalogue } from "@/lib/api/hedera";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/** The game store (the doc's screen 7): public, so the shelf is built static. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).hedera.store.meta;
  return pageMetadata({ locale, path: "/hedera/store", title: t.title, description: t.description });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;
  const t = messages.hedera.store;
  const catalogue = await getCatalogue();

  return (
    <HederaFrame messages={messages} locale={locale} art="store" title={t.title} intro={t.intro}>
      <StoreView catalogue={catalogue} messages={messages} locale={locale} />
    </HederaFrame>
  );
}
