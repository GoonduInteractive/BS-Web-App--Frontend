import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
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
  return pageMetadata({ locale, path: "/sign-in", title: `${t.signIn} | ${SITE_NAME}`, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <AuthCard messages={messages} locale={locale} title={messages.auth.signIn.title} offset="low">
      <Suspense>
        <SignInForm messages={messages} locale={locale} />
      </Suspense>
    </AuthCard>
  );
}
