"use client";

import Image from "next/image";

import { GateReturn } from "@/components/gates/GateReturn";
import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import { PlayGlyph } from "@/components/ui/PlayGlyph";
import { usePointerDrift } from "@/hooks/usePointerDrift";
import type { Messages } from "@/lib/utils/messages";

/**
 * Section 1 — the hero. Figma: `context/design/03-the-game/full-page.png` for
 * the 1440 frame, `full-page-mobile.png` for the 361 one. `hero.png` is the same
 * desktop frame at 619 wide, too small to measure off.
 *
 * Its own plate (`game/hero-plate.png`, the shrine figure under the stone gate),
 * which is NOT the gate 1 plate. The two are different renders of the same
 * clearing.
 *
 * WHAT THE FRAME MEASURES, at 1440 with the hero 834 tall. Everything below is
 * built to these, and they are why the offsets are literal rather than fluid:
 *
 *   chip      x  93..223   y 227..256   (131 x 30)
 *   title     x 112..402   y 297..519   cap 63, line pitch 80
 *   tagline   x 108..254   y 554..564   cap 11  -> 16px
 *   body      x 107..484   y 603..718   width 378, line pitch 25
 *   aside     x 1044..1313 y 409..498   width 270, LEFT-aligned
 *   button    x 1062..1256 y 599..653   (195 x 55)
 *   brackets  x 1034 and 1283          (11 x 35)
 *
 * So the content box is 108..1332 — full-bleed with 108px side padding, not the
 * centred max-w container this used to have, which put the title at 88.
 *
 * ONE DRIFT LAYER, NOT TWO. The gate leans its character and its environment by
 * different amounts, which is what reads as depth. This plate is a single render
 * with the shrine figure baked in, so there is nothing to separate and it leans
 * as one piece at the environment's 1%. Asking for two layers here would mean
 * asking Design to re-export the shrine on its own alpha.
 *
 * NO KEN BURNS. That belongs to the gates, where a still full-viewport image
 * needs to feel alive with no cursor involved. Here the drift already does that,
 * and running both would write `transform` twice on one node.
 */
export function GameHero({ messages }: { messages: Messages }) {
  const t = messages.theGame.hero;
  // Back layer only — see the note above.
  const { backRef } = usePointerDrift<HTMLDivElement, HTMLDivElement>();

  return (
    <section className="relative min-h-dvh overflow-hidden">
      {/* The overscan is what keeps the lean from exposing an edge. `scale-105`
          compiles to the `scale` property in v4, so it coexists with the hook's
          `transform` write instead of being overwritten by it. */}
      <div ref={backRef} aria-hidden className="absolute inset-0 scale-105">
        {/* NOT `priority`. The gate's plate is this route's LCP image; marking
            both eager put two multi-hundred-KB plates in the initial load and
            pushed the 1440 payload to 718KB against an 800KB budget. GateView
            warms this one on idle instead, so the tear never opens onto a hole. */}
        {/* OFF-CENTRE CROP ON SMALL SCREENS. The shrine sits at 60% across the
            plate, not 50%, so a portrait box cropping to the middle pushes it to
            the right edge — which is not what the 361 frame shows, where the
            shrine is dead centre under the arch. Desktop is wide enough to show
            the whole plate and needs no help. */}
        <Image
          src="/assets/game/hero-plate.png"
          alt={t.plateAlt}
          fill
          sizes="100vw"
          className="object-[60%_center] object-cover md:object-center"
        />
      </div>

      {/* ---- Scrim, in two layers ----
          MEASURED, NOT GUESSED. Comparing the frame's luminance against this
          plate band by band puts the frame's wash at roughly 75% at the left
          edge, 59% a quarter across, ~0 through the middle, and back to 30% at
          the right. That is not one linear ramp: the middle is genuinely CLEAR,
          which is what keeps the shrine and the stone gate readable. A single
          from/via/to could hit either the clear middle or the dark left, not
          both, so the two jobs are two layers.

          FLAGGED: Design gave no scrim value for this section, so these are
          derived from the frame rather than supplied. Worth confirming. */}
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

      <div className="relative z-10 mx-auto grid w-full max-w-[90rem] grid-cols-1 px-6 pb-24 md:grid-cols-[minmax(0,1fr)_18rem] md:px-27 md:pb-[7.25rem]">
        {/* ---- Left column: chip, title, tagline, body ---- */}
        <div className="pt-32 md:pt-[14.1875rem]">
          {/* HIDDEN ON MOBILE, per the frame, which shows no chip in the 361
              hero. The way back to the gate on a small screen is the menu, whose
              gate links land on the gate rather than the page. FLAGGED — it is a
              real loss of an obvious control, and worth confirming. */}
          <Reveal className="hidden md:-ml-4 md:block">
            <GateReturn label={messages.theGame.backToGate} />
          </Reveal>

          <Reveal
            as="h1"
            // -0.058em closes the width the face difference opens: matched on
            // cap height, Teko sets "COMPETE." 305px against the frame's 288, and
            // "ASCEND." 269 against 253. One value lands both frames, because the
            // same ratio holds at 63px as at 99px. Same compensation, and same
            // cause, as the gate title's — see --text-gate.
            className="font-display text-menu-fg text-game-hero mt-[1.625rem] font-semibold tracking-[-0.058em] uppercase md:mt-10"
          >
            {/* Three lines in the frame, one word each. */}
            {t.title.split(" ").map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </Reveal>

          <Reveal delay={80} className="mt-[4.125rem] max-w-96.5 md:mt-2.5">
            <p className="text-menu-fg font-body text-body font-semibold">{t.tagline}</p>
            <p className="text-menu-fg/85 font-body text-body mt-6">{t.body}</p>
          </Reveal>
        </div>

        {/* ---- Right column: aside, then the trailer CTA ----
            HIDDEN ON MOBILE, per the frame: the 361 hero carries the title,
            tagline, body and button only, and the aside does not reappear
            further down the page. The button moves into the left column's flow
            instead, which is where the mobile frame puts it. */}
        <Reveal delay={160} className="hidden md:block md:pt-[25.125rem]">
          {/* LEFT-aligned, not right. Every line in the frame starts at exactly
              1044 and ends ragged, between 1266 and 1313. */}
          <p className="text-menu-fg/85 font-body text-body max-w-[17.5rem]">{t.aside}</p>

          {/* The bracket overhangs the text column by ~10px in the frame. */}
          <div className="mt-[5.75rem] -ml-2.5">
            <TrailerButton label={t.cta} />
          </div>
        </Reveal>

        <div className="mt-[3.125rem] -ml-1 md:hidden">
          <TrailerButton label={t.cta} />
        </div>
      </div>
    </section>
  );
}

/**
 * WATCH TRAILER, with the play glyph the frame shows inside the button.
 *
 * The button box is 195 x 55 in both frames — identical on desktop and mobile.
 * The label measures a 13px cap, which is 18px, which is `text-h7`, which is
 * BracketButton's own default: this used to override it down to 16px and did not
 * need to.
 *
 * `inline-flex` is what puts the glyph beside the label. BracketButton renders
 * children straight into the button, so the layout has to come from here.
 */
function TrailerButton({ label }: { label: string }) {
  return (
    // `tracking-normal` and the explicit `py` OVERRIDE BracketButton's defaults
    // rather than adding to them — `cn` is tailwind-merge, so the later class
    // wins. Its `tracking-wide` sets the label 139 against the frame's 132, and
    // its `py-5` makes the box 58 tall against 55.
    <BracketButton className="inline-flex items-center gap-3 px-4.5 py-[1.15rem] leading-none tracking-normal">
      <PlayGlyph />
      {label}
    </BracketButton>
  );
}
