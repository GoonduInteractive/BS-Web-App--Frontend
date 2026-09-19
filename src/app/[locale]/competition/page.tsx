import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { ActiveTournaments } from "@/components/competition/ActiveTournaments";
import { CompetitionHero } from "@/components/competition/CompetitionHero";
import { CompetitionPanels } from "@/components/competition/CompetitionPanels";
import { EarnAchievements } from "@/components/competition/EarnAchievements";
import { FeaturedTournament } from "@/components/competition/FeaturedTournament";
import { GodsWatching } from "@/components/competition/GodsWatching";
import { HallOfAscension } from "@/components/competition/HallOfAscension";
import { Leaderboard } from "@/components/competition/Leaderboard";
import { RegionalLeagues } from "@/components/competition/RegionalLeagues";
import { GateCurtain } from "@/components/gates/GateCurtain";
import { GatePage, gateMetadata, gatePreview } from "@/components/gates/GatePage";
import { getJourney, getLeaderboard } from "@/lib/api/leaderboard";
import { getGate, nextGate } from "@/lib/gates";
import { isHidden } from "@/lib/hidden-sections";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * Ọnụ Ụzọ 4 — Competition. Figma: context/design/02-gates/ for the gate,
 * context/design/06-competition/ for the page behind it.
 *
 * Same arrangement as The Game and The Characters: the gate comes from
 * GatePage, and these sections are the page BEHIND it rather than sections
 * below it. The gate's CTA tears and this is what the tear opens onto.
 *
 * THE GROUND BELOW THE TABS IS A PAGE-LEVEL GRADIENT, as on The Characters:
 * read down the frame's left margin, `bg-roster` fits the whole run from the
 * tabs' rule at 772 to the scroll cue at 6040 within two values. The hero paints
 * its own ground, so the wrapper starts with the Featured Tournament section,
 * whose torn top and tabs bar paint their own solid stops over it.
 *
 * Every section is built. The page ends by handing on to the next gate through
 * the pull-up, as the frame's cue says.
 */
export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return gateMetadata("competition", params);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  // Not public yet — the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("competition")) return <HiddenSection section="competition" locale={locale} messages={messages} />;

  // THE FOOT HANDS ON TO THE MANIFEST'S NEXT GATE, which for gate 4 wraps to
  // The Game — the gate 4 frame's own cue reads DISCOVER THE GAME. This page's
  // frame previews THE CHARACTERS there instead, so the two frames disagree and
  // the manifest is followed until Design says. FLAGGED. Switching is one line:
  // getGate("characters") in place of nextGate(...).
  const next = nextGate(getGate("competition"));
  const nextCopy = messages.gates[next.id];
  const [board, journey] = await Promise.all([getLeaderboard(), getJourney()]);

  return (
    <GatePage id="competition" params={params}>
      <CompetitionHero messages={messages} />
      <div className="bg-roster">
        {/* Two panels behind one tab row: the tournaments page the frame draws,
            and the leaderboard. Both are rendered here on the server and the
            client switcher decides which is in layout. */}
        <CompetitionPanels
          messages={messages}
          tournaments={
            <>
              <FeaturedTournament messages={messages} locale={locale} />
              <ActiveTournaments messages={messages} locale={locale} />
              <EarnAchievements messages={messages} />
              <RegionalLeagues messages={messages} />
              <HallOfAscension messages={messages} />
            </>
          }
          leaderboard={
            <Leaderboard podium={board.podium} rows={board.rows} journey={journey} messages={messages} />
          }
        />
        {/* The last section goes INSIDE the curtain, which makes it sticky and
            puts the pull-up panel after it in flow — the arrangement The Game
            and The Characters use. */}
        <GateCurtain preview={gatePreview(next, locale, messages)} href={`/${locale}`} gate={next.id} title={nextCopy.title}>
          <GodsWatching messages={messages} nextGate={next.id} />
        </GateCurtain>
      </div>
    </GatePage>
  );
}
