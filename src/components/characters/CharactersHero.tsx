"use client";

import Image from "next/image";

import { GateReturn } from "@/components/gates/GateReturn";
import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import { usePointerDrift } from "@/hooks/usePointerDrift";
import type { Messages } from "@/lib/utils/messages";


export function CharactersHero({ messages }: { messages: Messages }) {
  const t = messages.characters.hero;
  const { frontRef, backRef } = usePointerDrift<HTMLDivElement, HTMLDivElement>();

  return (
    <section className="relative min-h-dvh overflow-hidden">

      <div ref={backRef} aria-hidden className="absolute inset-0 scale-105">

        <Image
          src="/assets/character/hero-plate.png"
          alt={t.plateAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <FloatingBlade alt={t.bladeAlt} layerRef={frontRef} />

      <div className="relative z-10 mx-auto grid w-full max-w-[90rem] grid-cols-1 px-6 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(15.25rem,19.93%)] lg:px-27 lg:pb-[7.25rem]">
        {/* ---- Left column: chip, title, body ---- */}
        <div className="pt-32 lg:pt-[14.1875rem]">
          {/* HIDDEN ON MOBILE, following the Game hero, whose own 361 frame
              shows no chip. There is no 361 frame for THIS page, so that is a
              carried-over decision rather than a read one. FLAGGED — it is a
              real loss of an obvious way back to the gate on the majority
              platform, and it is worth confirming for both pages at once. */}
          <Reveal className="hidden lg:-ml-4 lg:block">
            <GateReturn label={messages.characters.backToGate} />
          </Reveal>

          <Reveal
            as="h1"
            // SIZE IS --text-game-hero, REUSED. Both frames set a 63px cap at
            // 1440, so this title and the Game hero's are the same size and
            // cutting a second token for them would be a token that says
            // nothing.
            //
            // LEADING IS NOT. This frame's line pitch is 85 where the Game
            // hero's is 80, so the token's line-height is overridden here at
            // 85/99 = 0.86. That ratio is not a stylistic pick: at the size
            // token's floor, 63px, it yields a 54px pitch, which is exactly what
            // the Game page's 361 frame measures. The two real measurements
            // available agree on it.
            //
            // -0.058em is the Game hero's value, unchanged, and closes the same
            // gap for the same reason — matched on cap height Teko sets wider
            // than the frame's face. See --text-gate. Third measurement, same
            // finding; overview risk 3 stays open.
            //
            // THE LINE BREAK COMES FROM THE MAX-WIDTH, not from splitting the
            // string, which is StorySection's pattern. 36rem clears line 2's
            // 533px ink and falls short of "THE SOULS THAT SHAPE", so the frame's
            // two lines fall out of the wrap.
            className="font-display text-menu-fg text-game-hero mt-[1.625rem] max-w-[36rem] leading-[0.86] font-semibold tracking-[-0.058em] uppercase lg:mt-13"
          >
            {t.title}
          </Reveal>

          {/* 460px is what reproduces the frame's four lines, which break at
              "individuals", "realms." and "test". */}
          <Reveal delay={80} className="mt-10 max-w-[29.5rem] lg:mt-7">
            <p className="text-menu-fg/85 font-body text-body">{t.body}</p>
          </Reveal>
        </div>

        {/* ---- Right column: aside, then the CTA ----
            HIDDEN ON MOBILE, following the Game hero: its 361 frame drops the
            aside entirely and moves the button into the left column's flow. Same
            caveat as the chip — carried over, not read from a frame of this
            page's own. */}
        <Reveal delay={160} className="hidden lg:block lg:pt-[29rem]">
          {/* LEFT-aligned, not right. Every line in the frame starts at exactly
              1088 and ends ragged, between 1312 and 1345.

              IT OVERHANGS THE CONTENT EDGE, and that is the frame's doing rather
              than a slip here: the column is 244 wide, the third line's ink runs
              260, so it crosses the 1332 guide by 13px exactly as the frame
              does. Narrowing the box to contain it would re-break all three
              lines.

              A WIDTH, NOT A MAX-WIDTH. The column is 244 and the frame's third
              line is 260, so a max-width can never reach it — the paragraph is
              a block and fills the 244 it is given, and the cap never binds.
              Setting the width outright is what lets the box cross the column
              edge, which is the thing the frame actually does. */}
          <p className="text-menu-fg/85 font-body text-body w-[17rem]">{t.aside}</p>

          {/* The brackets start at 1088, level with the aside's left edge — no
              overhang here, unlike the Game hero's -2.5. */}
          <div className="mt-[4.625rem]">
            <JoinButton label={t.cta} />
          </div>
        </Reveal>

        <div className="mt-[3.125rem] -ml-1 lg:hidden">
          <JoinButton label={t.cta} />
        </div>
      </div>
    </section>
  );
}

/**
 * The machete suspended in front of the tree — the hero's second layer, and the
 * reason this page gets the full two-layer drift.
 *
 * LOCKED TO THE PLATE, NOT TO THE VIEWPORT. The blade hangs at a specific point
 * in front of the tree, and the tree moves as the plate is cover-fitted: a
 * `%`-positioned blade slides off it the moment the viewport stops being the
 * frame's 1440 x 834. So the geometry is expressed in PLATE pixels and scaled by
 * the same factor `object-cover` uses, which is `max(box width / 2880, box
 * height / 1714)`. `--plate-px` is that factor — the on-screen size of one pixel
 * of the plate — and every number below is a measurement off the 2880 x 1714
 * file:
 *
 *   964 x 1322   the asset's box, in plate pixels
 *   +278, +66    the blade's centre, offset from the plate's centre
 *
 * THEY WERE SOLVED, NOT EYEBALLED. Reading the blade's bounding box off the
 * frame gave a scale 5% out and an offset 10px off, because the frame is a
 * softened export and a brightness threshold catches a different extent on it
 * than on a crisp render. So the asset was composited over the cover-fitted
 * plate at every candidate scale and offset and scored against the frame; these
 * are the winner, at a mean absolute error of 9.3 across the blade's region.
 *
 * The asset box is far bigger than the blade because the artwork sits in a large
 * transparent canvas. That is why the box is placed by its CENTRE: the centre is
 * stable under the alpha bounds, an edge is not.
 *
 * HIDDEN BELOW `md`. Cover-fitting a 1.68 plate into a portrait box zooms it by
 * height, so a proportionally-correct blade is about 432px wide on a 380px
 * screen — across the body copy, with no scrim to lift the text off it. There is
 * no 361 frame for this page to say what should happen instead, so it is left
 * out rather than guessed at. FLAGGED.
 */
function FloatingBlade({
  alt,
  layerRef,
}: {
  alt: string;
  layerRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={layerRef}
      aria-hidden
      style={
        {
          // One plate pixel, on screen, after the cover fit: 100/2880 of the
          // width or 100/1714 of the height, whichever is larger.
          "--plate-px": "max(0.034722vw, 0.058343dvh)",
          // The blade's centre, offset from the plate's centre.
          left: "calc(50% + 278 * var(--plate-px))",
          top: "calc(50% + 66 * var(--plate-px))",
        } as React.CSSProperties
      }
      // `-translate-*` compiles to the `translate` property in v4, so it
      // coexists with the drift hook's `transform` write rather than being
      // overwritten by it — the same arrangement the plate's `scale-105` uses.
      className="pointer-events-none absolute hidden -translate-x-1/2 -translate-y-1/2 select-none lg:block"
    >
      <Image
        src="/assets/game/weapon-machete.png"
        alt={alt}
        width={954}
        height={1309}
        // 964 plate px wide. `h-auto` keeps the aspect, so only one axis is set.
        className="h-auto w-[calc(964*var(--plate-px))]"
        sizes="50vw"
      />
    </div>
  );
}

/**
 * JOIN THE TRIAL.
 *
 * The button box is 159 x 56 in the frame, with the label's ink 126 x 13 —
 * a 13px cap is 18px, which is `text-h7`, which is BracketButton's own default.
 *
 * `px-4` and the explicit `py` OVERRIDE BracketButton's `px-5 py-5` rather than
 * adding to them: `cn` is tailwind-merge, so the later class wins. 19px of
 * vertical padding on an 18px line box is the frame's 56; 16px of horizontal is
 * its measured 16 and 17.
 *
 * `tracking-normal` overrides the component's `tracking-wide` for the same
 * reason it does on the Game hero's trailer button — wide sets the label past
 * the frame's 126.
 */
function JoinButton({ label }: { label: string }) {
  return (
    <BracketButton className="px-4 py-[1.1875rem] leading-none tracking-normal whitespace-nowrap">
      {label}
    </BracketButton>
  );
}
