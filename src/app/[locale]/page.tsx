import { EntryScreen } from "@/components/chrome/EntryScreen";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { notFound } from "next/navigation";

/**
 * Entry screen + gate sequence — the landing page (overview section 5).
 * The four GateSections mount below the entry screen once they are designed.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <EntryScreen messages={getMessages(locale)} locale={locale} />;
}
