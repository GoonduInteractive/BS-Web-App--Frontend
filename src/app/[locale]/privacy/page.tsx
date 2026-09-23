import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalPage } from "@/lib/api/legal";
import { SITE_NAME, pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * Privacy Policy. Figma: `context/design/terms/`.
 *
 * The words are the content team's, in `src/content/legal/`, so this route is
 * the frame and `LegalDocument` is the page; both legal routes are the same
 * component with a different document.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const messages = getMessages(locale);
  const page = await getLegalPage(locale, "privacy").catch(() => null);
  return pageMetadata({
    locale,
    path: "/privacy",
    title: `${messages.footer.links.privacy} | ${SITE_NAME}`,
    // The opening section says what the document is, better than the site line.
    description: page?.sections[0]?.body.split("\n")[0].slice(0, 180) ?? messages.site.description,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const page = await getLegalPage(locale, "privacy").catch(() => null);
  if (!page) notFound();

  return <LegalDocument page={page} messages={getMessages(locale)} locale={locale} />;
}
