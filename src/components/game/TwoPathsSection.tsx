"use client";

import Image from "next/image";
import { useRef } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";

/**
 * Sections 3 and 4 — Two Paths, then Master Your Chi. Figma:
 * `full-page.png` y 1922..3718 at 1440, `full-page-mobile.png` y 1923..3729 at
 * 361. They are ONE torn field rather than two, so they are one section with
 * two blocks. The weapons and the fighter belong to Master Your Chi, not to
 * Two Paths — Two Paths is the two text columns and the ember rule.
 *
 * The field's gradient is CONFIRMED: linear-gradient(180deg, #200404 0%,
 * #0E0000 100%), which is --color-char to --color-void. It was previously
 * inferred from the delivered ornaments/torn-section.svg and now agrees.
 *
 * WHAT THE FRAMES MEASURE. Offsets are from the SECTION BOX top, which sits 32px
 * below the tear line StorySection draws — see that file for why it owns this
 * boundary. Geometry only; no colour was read off a PNG.
 *
 * 1440:
 *
 *   title      cap 127..176 (cap 50), ink 653, centred
 *   body       lines at 222 and 247, line 1 ink 295
 *   rule       x 717..731, y 389..843            (15 x 455)
 *   trials     head cap 446..475 (cap 30), ink 277; body from 524, box 328 wide
 *   arena      head cap 545..574, ink 302;        body from 625, box 348 wide
 *   glyphs     28 x 227 natural, left x 111 y 375, right x 1309 y 602
 *   chi title  cap 958..998 (cap 41), ink 337
 *   chi body   lines at 1043, 1068, 1093, 1118
 *   machete    art 172 x 188 at x 176, y 1281
 *   fighter    art 392 x 452 at x 572, y 1199
 *   spear      art 245 x 258 at x 1052, y 1351
 *   section    1761 to the bone tear
 *
 * VERIFIED: every one of those lands within 5px in the render, at 1440 and at
 * 361, measured against the tear line rather than the page top so the two are
 * on the same origin.
 *
 * 361: title cap 40 on a 54 pitch from 118; SURVIVE cap 23 at 441; the rule is
 * HORIZONTAL, 327 x 16 at y 636; the figures run 1000..1349 and come BEFORE the
 * Master Your Chi heading, which is at 1442.
 *
 * THREE THINGS THE MOBILE FRAME DOES DIFFERENTLY, none of them cosmetic:
 *
 *   1. Everything is centred. Desktop left-aligns the two path columns.
 *   2. The rule turns 90 degrees and sits between the two paths.
 *   3. The fighter comes FIRST, above the heading. `flex-col-reverse` gives
 *      that without reordering the markup or hurting the reading order.
 *
 * FLAGGED: the display face is not Teko, for the third and fourth time. Matched
 * on cap height Teko sets this title 21% wide and the two path headings 19%, so
 * each carries its own measured negative tracking. See --text-gate.
 */
export function TwoPathsSection({ messages }: { messages: Messages }) {
  const paths = messages.theGame.twoPaths;
  const chi = messages.theGame.chi;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, chiScene);

  return (
    <section ref={root} className="relative">
      {/* NO TORN EDGE HERE. This section's top boundary is drawn by
          StorySection, which has to own it: the tear cuts across Soma, and a
          divider in this section's flow can only ever end above him. Removing it
          cost no spacing — the tear moved up by exactly the 56px of flow it gave
          up, so the gap from the tear to the title is unchanged. */}

      {/* Mirrored glyph columns, the second set. Positioned against the SECTION
          rather than the content box, because the frame measures them from the
          page edge (x 111 and x 1309) and not from the column grid. Rendered at
          the delivered 28 x 227, which is what the frame measures. Hidden below
          lg — the 361 frame has none. */}
      <Image
        src="/assets/ornaments/nsibidi-glyphs-2.svg"
        alt=""
        aria-hidden
        width={28}
        height={227}
        className="absolute top-[23.375rem] left-[6.9375rem] hidden w-7 select-none lg:block"
      />
      <Image
        src="/assets/ornaments/nsibidi-glyphs-2.svg"
        alt=""
        aria-hidden
        width={28}
        height={227}
        className="absolute top-[37.5625rem] right-[6.5rem] hidden w-7 select-none lg:block"
      />

      <div className="from-char to-void bg-linear-to-b pt-[6.6875rem] pb-[7.5rem] md:pt-[7.375rem] md:pb-[5.5rem]">
        <div className="relative mx-auto max-w-[86rem] px-6 md:px-13.5">
          <Reveal className="flex flex-col items-center text-center">
            <SectionTitle
              mutedBefore={paths.titleMuted}
              className="text-menu-fg text-[3.90625rem] leading-[0.865] tracking-[-0.07em] md:text-[4.8828125rem] md:leading-none"
            >
              {paths.title}
            </SectionTitle>
            {/* The max-width is the LINE BREAK. The frame breaks after "two" at
                1440 and after "follows" at 361, which one width cannot do. */}
            <p className="text-menu-fg/75 font-body text-body mt-[1.1875rem] max-w-[16.25rem] md:mt-[1.1875rem] md:max-w-[20rem]">
              {paths.body}
            </p>
          </Reveal>

          {/*
            THE RULE IS THE CENTRING ANCHOR, not the box. The two columns are
            different widths — 328 against 348, forced by the arena body's
            longest line at 345 — so a box centred on the page would put the rule
            10px off where the frame has it. `1fr auto 1fr` centres the rule
            instead and the columns hang off it at a fixed 115px, which lands all
            three within 4px of the frame.
          */}
          <div className="mt-[8.9375rem] md:mt-[10.9375rem] md:grid md:translate-x-[5px] md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-x-[7.1875rem]">
            <Reveal className="text-center md:w-[20.5rem] md:justify-self-end md:text-left">
              <h3 className="font-display text-menu-fg text-[2.24375rem] leading-none font-semibold tracking-[-0.021em] uppercase md:text-[2.9296875rem] md:tracking-[-0.062em]">
                {paths.trialsTitle}
              </h3>
              <p className="text-menu-fg/75 font-body text-body mt-[0.5625rem] md:mt-[1.875rem]">
                {paths.trialsBody}
              </p>
            </Reveal>

            {/*
              Not wrapped in Reveal on purpose. An element that is display:none
              at its breakpoint never fires an IntersectionObserver, so it would
              stay at opacity 0 if the viewport were later widened past `md`.
              This rule is decorative and aria-hidden, so it simply appears.

              ROTATED, NOT SWAPPED. The frame lays the same 15 x 456 asset on its
              side at 361. Rotating the image inside a wrapper that owns the
              layout box is what keeps the flow correct: a rotated element still
              occupies its unrotated box, so the box is declared for each width
              and the artwork turns inside it.
            */}
            {/*
              THE WRAPPER IS THE INK, THE IMAGE IS THE FILE. The rule tapers to
              a point at both ends, so the artwork's last ~20% is feather that
              reads as nothing: a 15 x 400 box renders 12 x 326 of visible rule.
              Sizing the wrapper to what the frame MEASURES (15 x 455) and the
              image to the file box that produces it (19 x 558, centred and
              overflowing) is what makes the grid column the right width and the
              rule the right length at the same time.

              The negative top margin is the frame's: the rule starts 50px above
              the Survive the Trials cap, not level with it.
            */}
            <div className="relative mt-[2.9375rem] h-4 w-full md:-mt-[3.125rem] md:h-[28.4375rem] md:w-[0.9375rem]">
              <Image
                src="/assets/ornaments/two-paths-divider.svg"
                alt=""
                aria-hidden
                width={15}
                height={456}
                className="absolute top-1/2 left-1/2 h-[20.4375rem] w-[16px] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 select-none md:h-[28.4375rem] md:rotate-0"
              />
            </div>

            {/* The frame drops this column 99px below the other one. */}
            <Reveal
              delay={160}
              className="mt-[4.375rem] text-center md:mt-0 md:w-[21.75rem] md:justify-self-start md:pt-[6.1875rem] md:text-left"
            >
              <h3 className="font-display text-menu-fg text-[2.24375rem] leading-none font-semibold tracking-[-0.021em] uppercase md:text-[2.9296875rem] md:tracking-[-0.062em]">
                {paths.arenaTitle}
              </h3>
              <p className="text-menu-fg/75 font-body text-body mt-[0.5625rem] md:mt-[1.875rem]">
                {paths.arenaBody}
              </p>
            </Reveal>
          </div>
        </div>

        {/* ---- Master Your Chi ---- */}
        <div className="mt-[8rem] flex flex-col-reverse gap-y-[5.875rem] md:mt-[6.5625rem] md:flex-col md:gap-y-4">
          <div className="mx-auto max-w-[86rem] px-6 md:px-13.5">
            <Reveal className="flex flex-col items-center text-center">
              <SectionTitle className="text-menu-fg text-[3.421875rem] leading-none tracking-[-0.064em] md:text-[4.00390625rem]">
                {chi.title}
              </SectionTitle>
              {/* Two paragraphs, as both frames set it: the closing line stands
                  apart. 361 gives it a blank line, 1440 gives it none. */}
              <p className="text-menu-fg/75 font-body text-body mt-[1rem] max-w-[32rem] md:mt-[1.25rem]">
                {chi.body}
              </p>
              <p className="text-menu-fg/75 font-body text-body mt-[1.5625rem] max-w-[32rem] md:mt-0">
                {chi.bodyOutro}
              </p>
            </Reveal>
          </div>

          {/*
            THE FIGURE GROUP IS FULL BLEED AND SIZED BY ASPECT RATIO.

            Every one of these three ships with a lot of transparent margin, so a
            width set on the FILE renders a much smaller figure than the number
            suggests — the same trap StorySection records for Soma:

              weapon-machete   art 348 x 380  in 954 x 1309   (36.5% of width)
              weapon-spear     art 495 x 519  in 1156 x 1688  (42.8%)
              soma-nysc        art 2265 x 2744 in 4096 x 4096 (55.3%)

            So each one's box is back-calculated from where the frame puts its
            ART, and then offset by where the art sits inside its file. Every
            value below is a percentage of this container, and the container
            carries the frame's own aspect ratio — which is what makes `top` in
            percent scale with width alongside `left` and `width`. Fixed pixels
            would hold the composition only at exactly 1440 and 361.

            Capped at 90rem so the group stops growing past the frame width and
            centres instead.

            No CSS base rotation: the angles are in the artwork. The scene adds
            five degrees on top, which is a different thing.
          */}
          <div className="relative mx-auto aspect-[361/349] w-full max-w-[90rem] md:aspect-[1440/446]">
            <Reveal
              delay={80}
              className="absolute top-[-93.8%] left-[6.2%] w-[119.9%] md:top-[-53.7%] md:left-[2.65%] md:w-[32.7%]"
            >
              <div data-chi-machete>
                <Image
                  src="/assets/game/weapon-machete.png"
                  alt={chi.macheteAlt}
                  width={954}
                  height={1309}
                  sizes="(max-width: 767px) 120vw, 33vw"
                  className="w-full select-none"
                />
              </div>
            </Reveal>

            <Reveal
              delay={40}
              className="absolute top-[-36%] left-[-27.7%] z-10 w-[140.2%] md:top-[-38.1%] md:left-[24.95%] md:w-[51.7%]"
            >
              <div data-chi-fighter>
                <Image
                  src="/assets/characters/soma-nysc.png"
                  alt={chi.characterAlt}
                  width={4096}
                  height={4096}
                  sizes="(max-width: 767px) 140vw, 48vw"
                  className="w-full select-none"
                />
              </div>
            </Reveal>

            <Reveal
              delay={120}
              className="absolute top-[-26.1%] left-[-26.1%] z-20 w-[97.8%] md:top-[-60.4%] md:left-[60.2%] md:w-[39.6%]"
            >
              <div data-chi-spear>
                <Image
                  src="/assets/game/weapon-spear.png"
                  alt={chi.spearAlt}
                  width={1156}
                  height={1688}
                  sizes="(max-width: 767px) 98vw, 40vw"
                  className="w-full select-none"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * "The weapons turn past each other." Scroll-linked parallax on the Master Your
 * Chi group, at four rates with a counter-rotation on the two weapons.
 *
 * WHAT WAS MEASURED, and how much of it to trust. Tracked through the prototype
 * recording against the body text as the page reference:
 *
 *   body text   178px   baseline — it just moves with the page
 *   fighter     190px   +7%
 *   machete     210px   +18%
 *   spear              about +8% beyond the machete
 *
 *   machete   -45.9deg -> -51.1deg    (about 5deg)
 *   spear     +32.6deg -> +37.1deg    (about 5deg, opposite sign)
 *
 * No horizontal drift: x held at 273 and 1011 while both were fully in frame,
 * and the sideways movement at the edges was the objects clipping, not motion.
 *
 * The machete numbers are solid — a bright, large silhouette that cross-correlated
 * cleanly over ten frames. The spear is thin, dark and low contrast, correlation
 * failed on it, and the figure came from centroid tracking. So the finding is
 * "fastest of the four, turning about five degrees the other way", not the
 * specific percentage. And this is a Figma prototype recording, which
 * approximates scroll-linked motion: the ORDERING and the RATIOS are reliable,
 * the absolute travel is not.
 *
 * WHICH IS WHY THE RATIOS ARE KEPT AND THE TRAVEL IS TUNED. 7 : 18 : 25 is
 * preserved exactly, scaled so the spear travels 68px across the whole section.
 * Taking the percentages literally against this trigger's ~2700px of scroll
 * would move the machete nearly 500px and throw the composition off the page.
 * Ask Design to confirm the amount; the ordering is not in question.
 *
 * THE TEXT GETS NO TWEEN, deliberately — it is the reference the other three are
 * measured against, so it moves with the page and `Reveal` alone carries it in.
 *
 * ROTATION IS ABOUT THE ART, NOT THE FILE. Both weapon files are mostly
 * transparent margin and the art sits low and left inside them, so the file's
 * centre is not the blade's. Spinning about the default origin swings the
 * artwork through an arc instead of turning it in place; the origins below are
 * the art's own centre expressed as a percentage of the file.
 *
 * `scrub: 1` rather than `true`. The lag is the point: it stops the weapons
 * feeling glued to the scrollbar when someone flicks a trackpad.
 */

/** Extra travel against the page, in px, at the section's scroll extremes. */
const DRIFT = { fighter: 19, machete: 49, spear: 68 } as const;

/** Counter-rotation, in degrees, split either side of the frame's angle. */
const TURN = { machete: 2.5, spear: -2.5 } as const;

const chiScene: SceneBuilder = (gsap, q, section) => {
  const fighter = q("[data-chi-fighter]");
  const machete = q("[data-chi-machete]");
  const spear = q("[data-chi-spear]");

  gsap.matchMedia().add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { motion } = context.conditions as { motion: boolean };

      // Reduced motion drops the tweens entirely and leaves all three at their
      // MID position, which is the composition the frame draws. Not a slower
      // version — no movement at all, per overview section 10.
      if (!motion) {
        gsap.set([fighter, machete, spear], { clearProps: "all" });
        return;
      }

      const scrollTrigger = {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      } as const;

      const drift = (target: Element[], px: number, vars: gsap.TweenVars = {}) =>
        gsap.fromTo(
          target,
          { y: px, ...vars.from },
          { y: -px, ease: "none", scrollTrigger, ...vars.to },
        );

      drift(fighter, DRIFT.fighter);
      drift(machete, DRIFT.machete, {
        from: { rotate: TURN.machete },
        to: { rotate: -TURN.machete, transformOrigin: "47.5% 70%" },
      });
      drift(spear, DRIFT.spear, {
        from: { rotate: TURN.spear },
        to: { rotate: -TURN.spear, transformOrigin: "54% 70.4%" },
      });
    },
  );
};
