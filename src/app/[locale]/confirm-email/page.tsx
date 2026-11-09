import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { ConfirmEmail } from "@/components/auth/ConfirmEmail";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/** Figma: `context/design/auth-flow/`. One visitor's own page, so `noindex`. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).auth.meta;
  return pageMetadata({ locale, path: "/confirm-email", title: `${t.confirm} | ${SITE_NAME}`, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <AuthCard messages={messages} locale={locale} title={messages.auth.confirm.title} offset="high" titleGap="sm:mt-5">
      <Suspense>
        <ConfirmEmail messages={messages} locale={locale} />
      </Suspense>
    </AuthCard>
  );
}
