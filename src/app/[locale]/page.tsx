import type { Metadata } from "next";

import { EntryScreen } from "@/components/chrome/EntryScreen";
import { GatePortal } from "@/components/gates/GatePortal";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { notFound } from "next/navigation";

/**
 * Entry screen + the gates — the landing page (overview section 5), the
 * portal. The entry screen is the HTML; ENTER stands the visitor at Ọnụ Ụzọ 1,
 * and the cues and the rail move between the four doors without leaving this
 * route. A door's CTA is the only way to a page URL. See `GateEntry`.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = getMessages(locale);
  return pageMetadata({
    locale,
    path: "/",
    title: SITE_NAME,
    description: messages.site.description,
    imageAlt: messages.site.ogImageAlt,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  return <GatePortal entry={<EntryScreen messages={messages} />} locale={locale} gates={messages.gates} />;
}
