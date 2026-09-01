import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameHero } from "@/components/game/GameHero";
import { SoulsSection } from "@/components/game/SoulsSection";
import { StorySection } from "@/components/game/StorySection";
import { SummonsSection } from "@/components/game/SummonsSection";
import { TwoPathsSection } from "@/components/game/TwoPathsSection";
import { GateCurtain } from "@/components/gates/GateCurtain";
import { GatePage, gateMetadata, gatePreview } from "@/components/gates/GatePage";
import { gateHref, getGate } from "@/lib/gates";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * Ọnụ Ụzọ 1 — The Game. Figma: context/design/02-gates/ for the hero,
 * context/design/03-the-game/ for everything below it.
 *
 * The gate comes from GatePage. These sections are the page BEHIND it, not
 * sections below it: the gate's CTA tears and this is what the tear opens onto.
 * GatePage keeps the two faces apart, so they are passed plainly here.
 */
export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return gateMetadata("theGame", params);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  // The page ends by handing on to the next gate, as the frame's cue says.
  const next = getGate("characters");
  const nextHref = gateHref(locale, next);
  const nextCopy = messages.gates[next.id];

  return (
    <GatePage id="theGame" params={params}>
      <GameHero messages={messages} />
      <StorySection messages={messages} />
      <TwoPathsSection messages={messages} />
      <SoulsSection messages={messages} />
      {/* The last section is what the pull-up rides over, so it goes INSIDE the
          curtain — which makes it sticky and puts the panel after it in flow. */}
      <GateCurtain
        preview={gatePreview(next, locale, messages)}
        href={nextHref}
        title={nextCopy.title}
      >
        <SummonsSection messages={messages} nextHref={nextHref} />
      </GateCurtain>
    </GatePage>
  );
}
