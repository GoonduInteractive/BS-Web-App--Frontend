import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { HiddenSection } from "@/components/chrome/HiddenSection";
import { HederaFrame } from "@/components/hedera/HederaFrame";
import { OrderResult } from "@/components/hedera/OrderResult";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/** The order result (the doc's screen 12): `?id=`. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).hedera.order.meta;
  return pageMetadata({ locale, path: "/hedera/order", title: t.title, description: t.description, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;

  return (
    <HederaFrame messages={messages} locale={locale} art="order" title={messages.hedera.order.receipt}>
      <RequireAuth locale={locale}>
        <Suspense>
          <OrderResult messages={messages} locale={locale} />
        </Suspense>
      </RequireAuth>
    </HederaFrame>
  );
}
