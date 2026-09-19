"use client";

import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import { TornDivider } from "@/components/ui/TornDivider";
import { usePointerDrift } from "@/hooks/usePointerDrift";
import type { Messages } from "@/lib/utils/messages";


export function AboutHero({ messages }: { messages: Messages }) {
  const t = messages.about.hero;
  const { backRef } = usePointerDrift<HTMLDivElement, HTMLDivElement>();

  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        ref={backRef}
        aria-hidden
        className="absolute inset-0 scale-105 md:scale-[1.208]"
      >
        <div className="ken-burns absolute inset-0" style={{ "--kb-origin": "50% 40%" } as React.CSSProperties}>
          {/* HERO.jpg (3600 x 2400, the team on a sofa, faces across the middle
              band) replaces story.png here per the human (2026-09-19); the
              story section keeps story.png. Positioned on the faces at 40% down
              — no frame, read off the file. */}
          <Image
            src="/assets/about/HERO.jpg"
            alt={t.plateAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_40%]"
          />
        </div>
      </div>

      <div aria-hidden className="bg-ink/70 absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-360 flex-1 grid-cols-1 px-6 pb-28 md:px-27 lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:pb-24">
        {/* ---- Left column: title, tagline, body ---- */}
        <div className="pt-32 md:pt-40 lg:pt-72.75">
          <Reveal
            as="h1"
            className="font-display text-menu-fg text-game-hero font-semibold tracking-[-0.055em] uppercase"
          >
            {t.title.split("\n").map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </Reveal>

          <Reveal delay={80} className="mt-9.5 max-w-90 lg:mt-4.25">
            <p className="text-menu-fg font-body text-body">{t.tagline}</p>
            <p className="text-menu-fg font-body text-body mt-1.75">{t.body}</p>
            <p className="text-menu-fg font-body text-body mt-1.25 font-bold">{t.emphasis}</p>
          </Reveal>
        </div>

        {/* ---- Right column: aside, then the CTA ---- */}
        <Reveal delay={160} className="mt-12 lg:mt-0 lg:pt-104">
          <p className="text-menu-fg font-body text-body">{t.aside}</p>

          <div className="mt-8 -ml-0.75 lg:mt-12.75">
            <BracketButton className="px-4.5 py-[1.15rem] tracking-normal">{t.cta}</BracketButton>
          </div>
        </Reveal>
      </div>

      {/* The ground below, biting up into the plate. */}
      <TornDivider edge="top" seed={4821} className="text-ink absolute inset-x-0 bottom-0 z-20" />
    </section>
  );
}
