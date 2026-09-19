import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComingSoon } from "@/components/chrome/ComingSoon";
import { SITE_NAME, pageMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * Privacy Policy — not written yet, so the route opens onto the Coming Soon
 * page with this page's name on the chip. Kept out of search until there is a
 * page to find. When the copy arrives, this file is what changes.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const messages = getMessages(locale);
  return pageMetadata({
    locale,
    path: "/privacy",
    title: `${messages.footer.links.privacy} | ${SITE_NAME}`,
    description: messages.site.description,
    noIndex: true,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  return <ComingSoon messages={messages} locale={locale} pageTitle={messages.footer.links.privacy} />;
}
