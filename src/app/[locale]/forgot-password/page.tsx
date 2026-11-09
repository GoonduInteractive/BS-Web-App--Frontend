import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
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
  return pageMetadata({ locale, path: "/forgot-password", title: `${t.forgot} | ${SITE_NAME}`, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <AuthCard messages={messages} locale={locale} title={messages.auth.forgot.title} offset="low"
      back={{ href: `/${locale}/sign-in`, label: messages.auth.forgot.back }}>
      <Suspense>
        <ForgotPasswordForm messages={messages} locale={locale} />
      </Suspense>
    </AuthCard>
  );
}
