import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { HiddenSection } from "@/components/chrome/HiddenSection";
import { ConnectFlow } from "@/components/hedera/ConnectFlow";
import { HederaFrame } from "@/components/hedera/HederaFrame";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/** Link a wallet (the doc's screens 3 to 6). `?next=` is where to go after. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).hedera.connect.meta;
  return pageMetadata({ locale, path: "/hedera/connect", title: t.title, description: t.description, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;
  const t = messages.hedera.connect;

  return (
    <HederaFrame messages={messages} locale={locale} art="connect" title={t.title} intro={t.intro} nav={false}>
      <RequireAuth locale={locale}>
        <Suspense>
          <ConnectFlow messages={messages} locale={locale} />
        </Suspense>
      </RequireAuth>
    </HederaFrame>
  );
}
