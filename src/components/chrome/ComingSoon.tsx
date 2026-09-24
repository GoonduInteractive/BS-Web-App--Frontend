import { ComingSoonHero } from "@/components/chrome/ComingSoonHero";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";


export function ComingSoon({
  messages,
  locale,
  pageTitle,
}: {
  messages: Messages;
  locale: Locale;
  /** The name of the page that is not here yet - goes on the chip. */
  pageTitle: string;
}) {
  const t = messages.comingSoon;

  return (
    <main className="flex flex-col">
      <ComingSoonHero pageTitle={pageTitle} title={t.title} body={t.body} cta={t.cta} home={`/${locale}`} />
      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
