"use client";

import Image from "next/image";
import { useRef } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";


export function TwoPathsSection({ messages }: { messages: Messages }) {
  const paths = messages.theGame.twoPaths;
  const chi = messages.theGame.chi;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, chiScene);

  return (
    <section ref={root} className="relative overflow-x-clip">
      {/* `overflow-x-clip`, NOT `overflow-hidden`. Master Your Chi lays its fighter and
        weapons at up to 140% of the section and pulls them left of it, which is
        the designed composition on a phone — but unclipped it let the whole page
        scroll sideways, 99px at 380. `overflow-hidden` would have fixed that and
        broken something else: hidden on one axis forces the other to become a
        scroll container, and this art is meant to bleed vertically. `clip` is the
        one value that stops the horizontal bleed and leaves the vertical alone. */}

      <Image
        src="/assets/ornaments/nsibidi-glyphs-2.svg"
        alt=""
        aria-hidden
        width={28}
        height={227}
        className="absolute top-93.5 left-27.75 hidden w-7 select-none lg:block"
      />
      <Image
        src="/assets/ornaments/nsibidi-glyphs-2.svg"
        alt=""
        aria-hidden
        width={28}
        height={227}
        className="absolute top-150.25 right-26 hidden w-7 select-none lg:block"
      />

      <div className="from-char to-void bg-linear-to-b pt-26.75 pb-30 md:pt-29.5 md:pb-22">
        <div className="relative mx-auto max-w-344 px-6 md:px-13.5">
          <Reveal className="flex flex-col items-center text-center">
            <SectionTitle
              mutedBefore={paths.titleMuted}
              className="text-menu-fg text-[3.90625rem] leading-[0.865] tracking-[-0.07em] md:text-[4.8828125rem] md:leading-none"
            >
              {paths.title}
            </SectionTitle>

            <p className="text-menu-fg/75 font-body text-body mt-4.75 max-w-65 md:mt-4.75 md:max-w-[20rem]">
              {paths.body}
            </p>
          </Reveal>

          {/* THE THREE-COLUMN SPLIT STARTS AT `lg`, AND ITS GUTTER IS A
              PROPORTION. Two 328 and 348 columns either side of a 15px rule with
              the frame own 115 gutters is 921 of content; `md` offered 660 at 768,
              so the right-hand column ran 250px past the viewport and took the
              page with it. 9.4% is 115 over the frame 1224 content box — 115 at
              1440, 86 at 1024, which is what makes it fit. */}
          <div className="mt-35.75 lg:mt-43.75 lg:grid lg:translate-x-1.25 lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-x-[9.4%]">
            <Reveal className="text-center lg:w-82 lg:justify-self-end lg:text-left">
              <h3 className="font-display text-menu-fg text-[2.24375rem] leading-none font-semibold tracking-[-0.021em] uppercase lg:text-[2.9296875rem] lg:tracking-[-0.062em]">
                {paths.trialsTitle}
              </h3>
              <p className="text-menu-fg/75 font-body text-body mt-2.25 lg:mt-7.5">
                {paths.trialsBody}
              </p>
            </Reveal>

            <div className="relative mt-11.75 h-4 w-full lg:-mt-12.5 lg:h-113.75 lg:w-3.75">
              <Image
                src="/assets/ornaments/two-paths-divider.svg"
                alt=""
                aria-hidden
                width={15}
                height={456}
                className="absolute top-1/2 left-1/2 h-81.75 w-4 max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 select-none lg:h-113.75 lg:rotate-0"
              />
            </div>

            {/* The frame drops this column 99px below the other one. */}
            <Reveal
              delay={160}
              className="mt-17.5 text-center lg:mt-0 lg:w-87 lg:justify-self-start lg:pt-24.75 lg:text-left"
            >
              <h3 className="font-display text-menu-fg text-[2.24375rem] leading-none font-semibold tracking-[-0.021em] uppercase lg:text-[2.9296875rem] lg:tracking-[-0.062em]">
                {paths.arenaTitle}
              </h3>
              <p className="text-menu-fg/75 font-body text-body mt-2.25 lg:mt-7.5">
                {paths.arenaBody}
              </p>
            </Reveal>
          </div>
        </div>

        {/* ---- Master Your Chi ---- */}
        <div className="mt-32 flex flex-col-reverse gap-y-23.5 md:mt-26.25 md:flex-col md:gap-y-4">
          <div className="mx-auto max-w-344 px-6 md:px-13.5">
            <Reveal className="flex flex-col items-center text-center">
              <SectionTitle className="text-menu-fg text-[3.421875rem] leading-none tracking-[-0.064em] md:text-[4.00390625rem]">
                {chi.title}
              </SectionTitle>

              <p className="text-menu-fg/75 font-body text-body mt-4 max-w-lg md:mt-5">
                {chi.body}
              </p>
              <p className="text-menu-fg/75 font-body text-body mt-6.25 max-w-lg md:mt-0">
                {chi.bodyOutro}
              </p>
            </Reveal>
          </div>


          <div className="relative mx-auto aspect-361/349 w-full max-w-360 md:aspect-1440/446">
            <Reveal
              delay={80}
              className="absolute top-[-93.8%] left-[6.2%] w-[119.9%] md:top-[-53.7%] md:left-[2.65%] md:w-[32.7%]"
            >
              {/* THE WEAPONS TURN ON A LARGE SCREEN. Two files per weapon, per the
                  human: the delivered still below `lg`, the delivered GIF from it.
                  Each is its own element and both are lazy, so the one that is
                  `display: none` is never fetched — a hidden lazy image never
                  intersects. The GIFs are animated, which Next's optimiser
                  passes through untouched; `unoptimized` says so out loud. A GIF
                  cannot be paused, so under reduced motion the still stays even
                  on a large screen — the one way to honour the preference.
                  `Sword.gif` frames its blade where `weapon-machete.png` does
                  (alpha 0.29..0.65 x 0.56..0.84 of the box in both), so it takes
                  the same box. */}
              <div data-chi-machete>
                <Image
                  src="/assets/game/weapon-machete.png"
                  alt={chi.macheteAlt}
                  width={954}
                  height={1309}
                  sizes="(max-width: 767px) 120vw, 33vw"
                  className="w-full select-none lg:hidden lg:motion-reduce:block"
                />
                <Image
                  src="/assets/game/Sword.gif"
                  alt={chi.macheteAlt}
                  width={476}
                  height={654}
                  unoptimized
                  className="hidden w-full select-none lg:block lg:motion-reduce:hidden"
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
              {/* `Spear.gif` is a wider canvas than `weapon-spear.png` (616:844
                  against 1156:1688) with the spear drawn 7% smaller in it, so it
                  is set 107% wide in the same box — that puts its spear on the
                  still's spear to within half a percent, and leaves the box (and
                  the drift's 54% / 70.4% pivot) exactly where the still had it. */}
              <div data-chi-spear>
                <Image
                  src="/assets/game/weapon-spear.png"
                  alt={chi.spearAlt}
                  width={1156}
                  height={1688}
                  sizes="(max-width: 767px) 98vw, 40vw"
                  className="w-full select-none lg:hidden lg:motion-reduce:block"
                />
                <Image
                  src="/assets/game/Spear.gif"
                  alt={chi.spearAlt}
                  width={616}
                  height={844}
                  unoptimized
                  className="hidden w-[107%] max-w-none select-none lg:block lg:motion-reduce:hidden"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}


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
