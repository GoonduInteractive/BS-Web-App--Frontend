import { ComingSoonHero } from "@/components/chrome/ComingSoonHero";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * A page that exists but is not built yet. Figma: `context/design/coming-soon/`
 * `Coming soon!.png` (1440 x 1000) and `Coming soon!-mobile.png` (360 x 1264): the
 * first gate's plate, darkened, with the page's name on the torn chip, COMING
 * SOON!, two lines and BACK TO HOME centred in the space under the header;
 * then the footer. Terms of Use and Privacy Policy open onto it for now.
 *
 * THE HERO IS THE WHOLE VIEWPORT, per the human ("the hero should be full
 * screen, then you can scroll to see the footer") - the 1440 frame draws the
 * footer inside its 1000, the phone frame below its 735; the rule is one
 * screen, then the footer, at every width. The hero itself is a client
 * component for the two motions it carries; this shell stays on the server so
 * the messages object never crosses to the client - only the four strings do.
 */
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
