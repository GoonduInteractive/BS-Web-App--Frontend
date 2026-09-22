import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CharactersHero } from "@/components/characters/CharactersHero";
import { MoreChampionsSection } from "@/components/characters/MoreChampionsSection";
import { RosterSection } from "@/components/characters/RosterSection";
import { getCharacters } from "@/lib/api/characters";
import { GateCurtain } from "@/components/gates/GateCurtain";
import { GatePage, gateMetadata, gatePreview } from "@/components/gates/GatePage";
import { getGate, nextGate } from "@/lib/gates";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * Ọnụ Ụzọ 2 — The Characters. Figma: context/design/02-gates/ for the gate,
 * context/design/04-characters/ for the page behind it.
 *
 * Same arrangement as The Game: the gate comes from GatePage, and these sections
 * are the page BEHIND it rather than sections below it. The gate's CTA tears and
 * this is what the tear opens onto.
 *
 * The hero and the roster exist. MORE CHAMPIONS ARE COMING and the scroll cue
 * are designed and not yet built.
 *
 * THE GROUND IS A PAGE-LEVEL GRADIENT, NOT A SECTION ONE. Read down the frame's
 * left margin, the human's linear-gradient(180deg, #170303, #010101) fits the
 * whole 5570px page to within a value at every sample; mapped onto the roster
 * section alone it would run three times as steep. So it is applied here, once,
 * and each section paints over its own share of it — the hero with its plate,
 * and MORE CHAMPIONS with its own fill once that is built. See `bg-roster`.
 */
export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return gateMetadata("characters", params);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const characters = await getCharacters(locale);
  // The page ends by handing on to the next DOOR, on the portal — see GateEntry.
  const next = nextGate(getGate("characters"));
  const nextCopy = messages.gates[next.id];

  return (
    <GatePage id="characters" params={params}>
      <div className="bg-roster">
        <CharactersHero messages={messages} />
        <RosterSection characters={characters} messages={messages} locale={locale} />
        <GateCurtain preview={gatePreview(next, locale, messages)} href={`/${locale}`} gate={next.id} title={nextCopy.title}>
          <MoreChampionsSection messages={messages} nextGate={next.id} />
        </GateCurtain>
      </div>
    </GatePage>
  );
}
