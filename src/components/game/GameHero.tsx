"use client";

import Image from "next/image";

import { GateReturn } from "@/components/gates/GateReturn";
import { Reveal } from "@/components/motion/Reveal";
import { DownloadGameButton } from "@/components/ui/DownloadGameButton";
import { usePointerDrift } from "@/hooks/usePointerDrift";
import type { Messages } from "@/lib/utils/messages";


export function GameHero({ messages }: { messages: Messages }) {
  const t = messages.theGame.hero;
  // Back layer only - see the note above.
  const { backRef } = usePointerDrift<HTMLDivElement, HTMLDivElement>();

  return (
    <section className="relative min-h-dvh overflow-hidden">

      <div ref={backRef} aria-hidden className="absolute inset-0 scale-105">

        <Image
          src="/assets/game/hero-plate.png"
          alt={t.plateAlt}
          fill
          sizes="100vw"
          className="object-[60%_center] object-cover md:object-center"
        />
      </div>

      {/* 1. The ramp across the whole width. */}
      <div
        aria-hidden
        className="from-ink/80 via-ink/5 to-ink/35 absolute inset-0 bg-gradient-to-r via-45%"
      />
      {/* 2. A wash over the left two-fifths only, which is what carries the
             title and body copy. Contrast, not atmosphere. */}
      <div
        aria-hidden
        className="from-ink/45 absolute inset-0 bg-gradient-to-r to-transparent to-40%"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-360 grid-cols-1 px-6 pb-24 md:grid-cols-[minmax(0,1fr)_18rem] md:px-27 md:pb-29">
        {/* ---- Left column: chip, title, tagline, body ---- */}
        <div className="pt-32 md:pt-56.75">

          <Reveal className="hidden md:-ml-4 md:block">
            <GateReturn label={messages.theGame.backToGate} />
          </Reveal>

          <Reveal
            as="h1"

            className="font-display text-menu-fg text-game-hero mt-6.5 font-semibold tracking-[-0.058em] uppercase md:mt-10"
          >
            {/* Three lines in the frame, one word each. */}
            {t.title.split(" ").map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </Reveal>

          <Reveal delay={80} className="mt-16.5 max-w-96.5 md:mt-2.5">
            <p className="text-menu-fg font-body text-body font-semibold">{t.tagline}</p>
            <p className="text-menu-fg/85 font-body text-body mt-6">{t.body}</p>
          </Reveal>
        </div>

        {/* ---- Right column: aside, then the trailer CTA ---- */}
        <Reveal delay={160} className="hidden md:block md:pt-100.5">
          {/* LEFT-aligned, not right. Every line in the frame starts at exactly
              1044 and ends ragged, between 1266 and 1313. */}
          <p className="text-menu-fg/85 font-body text-body max-w-70">{t.aside}</p>

          {/* The bracket overhangs the text column by ~10px in the frame. */}
          <div className="mt-23 -ml-2.5">
            <TrailerButton label={messages.site.downloadCta} />
          </div>
        </Reveal>

        <div className="mt-12.5 -ml-1 md:hidden">
          <TrailerButton label={messages.site.downloadCta} />
        </div>
      </div>
    </section>
  );
}


/**
 * WATCH TRAILER, for now DOWNLOAD GAME (2026-09-19, per the human) - same
 * box, no play glyph; the trailer button is one swap back: `BracketButton`
 * with `<PlayGlyph />` before the label, at the same classes.
 */
function TrailerButton({ label }: { label: string }) {
  return (
    <DownloadGameButton label={label} className="inline-flex items-center gap-3 px-4.5 py-[1.15rem] leading-none tracking-normal" />
  );
}
