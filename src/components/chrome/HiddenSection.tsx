import { ComingSoon } from "@/components/chrome/ComingSoon";
import { hiddenSectionLabel, type HiddenSectionName } from "@/lib/hidden-sections";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The Coming Soon page standing in for a route in a section the public may
 * not see yet (`lib/hidden-sections.ts`), the section's name on the chip.
 * Every page in such a section returns this INSTEAD of its own tree, as soon
 * as it has its locale and messages (after its own 404 checks, so an unknown
 * slug is still a 404):
 *
 *   if (isHidden("news")) return <HiddenSection section="news" locale={locale} messages={messages} />;
 *
 * Its head comes from `pageMetadata`, which makes the same swap for the route.
 *
 * IT HAS TO BE THE PAGE THAT STEPS ASIDE, not a layout above it. Next renders
 * every segment and ships each one's tree in the flight payload for the client
 * router, so a layout that never places its children still sends the page's
 * markup — the hidden copy, pictures and prices, readable in the page source.
 * Measured with the swap in a layout: the news index's payload carried three
 * `article` elements and their pictures with nothing of them in the DOM, and
 * ran 13KB heavier than Terms of Use. In the page, it is the Coming Soon tree
 * and nothing else.
 */
export function HiddenSection({
  section,
  locale,
  messages,
}: {
  section: HiddenSectionName;
  locale: Locale;
  messages: Messages;
}) {
  return <ComingSoon messages={messages} locale={locale} pageTitle={hiddenSectionLabel(section, messages)} />;
}
