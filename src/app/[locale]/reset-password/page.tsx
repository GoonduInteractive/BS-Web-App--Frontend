import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
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
  return pageMetadata({ locale, path: "/reset-password", title: `${t.reset} | ${SITE_NAME}`, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <AuthCard messages={messages} locale={locale} title={messages.auth.reset.title} offset="low">
      <Suspense>
        <ResetPasswordForm messages={messages} locale={locale} />
      </Suspense>
    </AuthCard>
  );
}
