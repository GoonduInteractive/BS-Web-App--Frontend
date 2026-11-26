import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { HiddenSection } from "@/components/chrome/HiddenSection";
import { HederaFrame } from "@/components/hedera/HederaFrame";
import { PrizeClaim } from "@/components/hedera/PrizeClaim";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/** An HBAR prize (the doc's screen 13): `?id=`. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).hedera.prize.meta;
  return pageMetadata({ locale, path: "/hedera/prize", title: t.title, description: t.description, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;

  return (
    <HederaFrame messages={messages} locale={locale} art="prize" title={messages.hedera.prize.title}>
      <RequireAuth locale={locale}>
        <Suspense>
          <PrizeClaim messages={messages} locale={locale} />
        </Suspense>
      </RequireAuth>
    </HederaFrame>
  );
}
