import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getSignUpRegions } from "@/lib/api/regions";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * Figma: `context/design/auth-flow/`. One visitor's own page, so `noindex`.
 * The region list comes from the API at build, refreshed at most hourly, so a
 * region an admin adds is offered without a redeploy.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).auth.meta;
  return pageMetadata({ locale, path: "/sign-up", title: `${t.signUp} | ${SITE_NAME}`, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  const regions = await getSignUpRegions();

  return (
    <AuthCard messages={messages} locale={locale} title={messages.auth.signUp.title} offset="high" titleGap="sm:mt-8">
      <Suspense>
        <SignUpForm messages={messages} locale={locale} regions={regions} />
      </Suspense>
    </AuthCard>
  );
}
