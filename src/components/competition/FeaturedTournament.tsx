import { Swords } from "lucide-react";

import { FeaturedCard } from "@/components/competition/FeaturedCard";
import { TrialIntro } from "@/components/competition/TrialIntro";
import { Reveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { getFeaturedTournament } from "@/lib/api/tournaments";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * FEATURED TOURNAMENT - the first section of the Tournaments panel. Figma:
 * `context/design/06-competition/Competition.png`, y 772..1791 at 1440.
 *
 * The pitch with JOIN THE TRIAL, then the heading and the Wrath of Nze Ugwuoke
 * card. The torn edge and the tab row that head this section in the frame
 * moved up to `CompetitionPanels` when the Leaderboard panel arrived - they
 * head both panels now - so this starts at the intro.
 *
 * THE HEADING: ink 76..535, cap 40 at 1102 → `--text-section-heading`, the
 * size every heading on this page shares. Its 54px box sits at 1101, 101 below
 * the intro's bottom at 1000, and the card follows 44 below it at 1199.
 *
 * WITH NO TOURNAMENT TO SHOW (the API's list empty, or all finished) the
 * heading stands over the empty state the Hall of Ascension uses, in the same
 * COMING SOON words; no frame draws it. ACTIVE TOURNAMENTS, empty too, draws
 * nothing, so the page says it once.
 *
 * A Server Component that reads the adapter directly, per the data rule; the
 * card never learns where its tournament came from.
 */
export async function FeaturedTournament({
  messages,
  locale,
}: {
  messages: Messages;
  locale: Locale;
}) {
  const tournament = await getFeaturedTournament(locale);

  return (
    <section>
      <TrialIntro messages={messages} />

      <div className="mx-auto w-full px-6 pt-16 lg:px-20 lg:pt-25.25">
        <Reveal
          as="h2"
          className="font-display text-menu-fg text-section-heading font-semibold tracking-[-0.058em] uppercase"
        >
          {messages.competition.featured.heading}
        </Reveal>
        {tournament ? (
          <div className="mt-8 lg:mt-11">
            <FeaturedCard tournament={tournament} messages={messages} locale={locale} />
          </div>
        ) : (
          <EmptyState
            icon={Swords}
            title={messages.comingSoon.title}
            body={messages.comingSoon.body}
            className="mt-14 xl:mt-23"
          />
        )}
      </div>
    </section>
  );
}
