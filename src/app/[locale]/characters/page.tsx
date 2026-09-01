import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CharactersHero } from "@/components/characters/CharactersHero";
import { MoreChampionsSection } from "@/components/characters/MoreChampionsSection";
import { RosterSection } from "@/components/characters/RosterSection";
import { GateCurtain } from "@/components/gates/GateCurtain";
import { GatePage, gateMetadata, gatePreview } from "@/components/gates/GatePage";
import { gateHref, getGate, nextGate } from "@/lib/gates";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";


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
  // The page ends by handing on to the next gate, as the frame's cue says.
  const next = nextGate(getGate("characters"));
  const nextHref = gateHref(locale, next);
  const nextCopy = messages.gates[next.id];

  return (
    <GatePage id="characters" params={params}>
      <div className="bg-roster">
        <CharactersHero messages={messages} />
        <RosterSection messages={messages} locale={locale} />
        <GateCurtain
          preview={gatePreview(next, locale, messages)}
          href={nextHref}
          title={nextCopy.title}
        >
          <MoreChampionsSection messages={messages} nextHref={nextHref} />
        </GateCurtain>
      </div>
    </GatePage>
  );
}
