"use client";

import Image from "next/image";
import { useRef } from "react";

import { ScrollCue } from "@/components/gates/ScrollCue";
import { BracketButton } from "@/components/ui/BracketButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TornDivider } from "@/components/ui/TornDivider";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";

/**
 * Section 6 — Answer the Summons. Figma:
 * `context/design/03-the-game/SummonsSection.png` at 1440, and the foot of
 * `full-page-mobile.png` at 361.
 *
 * The last block before the page hands over to the next gate: copy and CTA on
 * the left, an ascendant hanging through the torn edge on the right, and the
 * scroll cue centred at the foot pointing on to The Characters.
 *
 * WHAT THE FRAME MEASURES, at 1440:
 *
 *   tear      mean y 22.5, ~30px of excursion   (which is TornSurface's 47.4
 *                                                depth, not the old scale 26)
 *   title     x 161..700   y 211..259   cap 49 -> 77px
 *   body      x 160..589   y 306..393   width 430, four lines
 *   button    x 188..346   y 452..506   (159 x 55)
 *   brackets  x 160 and 373
 *   figure    x 600..1407  y 0..596, cropped at the top by the tear
 *
 * So this section's content starts at x 160, not the 108 the hero uses. The
 * frames genuinely differ section to section; this is measured, not carried over.
 *
 * THE FIGURE HANGS FROM THE TEAR. It is not a picture placed inside the section
 * — its top is flush with the section's top edge and the torn boundary cuts
 * across it, which is why the divider is drawn ABOVE it in the stacking order
 * and the section clips. On mobile the frame stacks it above the copy instead.
 */
export function SummonsSection({
  messages,
  nextHref,
}: {
  messages: Messages;
  nextHref: string;
}) {
  const t = messages.theGame.summons;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, summonsScene);

  return (
    <section ref={root} className="bg-ink relative overflow-hidden">
      {/*
        THE SECTION OWNS ITS OWN TOP EDGE, and it is drawn OVER the figure. That
        stacking is the whole reason it moved here from the end of SoulsSection,
        where it used to sit in normal flow: the frame has the bone cutting
        ACROSS the ascendant, whose grass-topped crop starts above the tear line
        and is hidden by it. A divider in the previous section's flow can only
        ever end above this one's content, never on top of it.

        Absolute, so it overlays the section's first 56px instead of pushing them
        down, and z-20 so it clears the figure at z-0 and the copy at z-10.
      */}
      <TornDivider
        edge="bottom"
        seed={4102}
        className="text-bone absolute inset-x-0 -top-2 z-20"
      />

      <div className="relative mx-auto max-w-[90rem] px-6 md:px-40">
        {/*
          The figure. In flow above the copy on mobile, hung from the top edge on
          desktop.

          ON MOBILE IT IS WIDER THAN THE SCREEN, deliberately: the 361 frame sets
          the leg pair at 155px, which is 43% of the viewport, and the legs are
          only 23% of the file's width. 189vw is what puts them there, centred by
          `ml-[50%]` and a translate. `-translate-x-1/2` compiles to the
          `translate` property in v4, so it coexists with the parallax's
          `transform` write rather than being clobbered by it.

          Sized and placed by matching the SILHOUETTE, not the file bounds: the
          leg pair measures 292px across at the frame's y 320 and the feet bottom
          out at y 600, and 1128px wide at -top-14 / -right-41 puts both there.
          The file's own edges are useless as an anchor — most of its 1920px is
          transparent margin. It runs off the right of the 1440 container by
          design; the section clips it.
        */}
        <div
          data-summons-figure
          className="ml-[50%] w-[189vw] max-w-none -translate-x-1/2 md:absolute md:-top-14 md:-right-41 md:z-0 md:ml-0 md:w-[70.5rem] md:translate-x-0"
        >
          <div data-summons-figure-inner>
            <Image
              src="/assets/characters/black-legs.png"
              alt={t.imageAlt}
              width={1920}
              height={1080}
              sizes="(max-width: 767px) 80vw, 71vw"
              className="w-full select-none"
            />
          </div>
        </div>

        <div className="relative z-10 pt-10 pb-16 md:pt-[12.8125rem] md:pb-[10.5rem]">
          {/* The title rides up out of a clip on entry, so it is masked by an
              overflow-hidden wrapper rather than just faded. */}
          <div data-summons-title className="overflow-hidden pb-1">
            <SectionTitle className="text-menu-fg text-[3rem] leading-[0.95] tracking-[-0.066em] md:text-[4.8125rem]">
              {t.title}
            </SectionTitle>
          </div>

          {/* `whitespace-pre-line` honours the line breaks in the message. The
              frame breaks after the first two sentences and lets only the third
              wrap, which no max-width alone can reproduce. */}
          <p
            data-summons-body
            className="text-menu-fg/85 font-body text-body mt-[1.15rem] max-w-[27rem] whitespace-pre-line"
          >
            {t.body}
          </p>

          {/* No bracket overhang here, unlike the hero: this frame lines the
              LEFT BRACKET up with the text column at x 160, not the button. */}
          <div data-summons-cta className="mt-12">
            <BracketButton className="inline-flex items-center gap-3 px-4.5 py-[1.15rem] leading-none tracking-normal">
              {t.cta}
            </BracketButton>
          </div>
        </div>
      </div>

      <div
        data-summons-cue
        className="relative z-10 flex justify-center pb-14 md:pb-20"
      >
        <ScrollCue href={nextHref} label={t.cue} />
      </div>
    </section>
  );
}

/**
 * The section's entrance and its parallax.
 *
 * WHY GSAP HERE AND `Reveal` EVERYWHERE ELSE
 *
 * `Reveal` is an IntersectionObserver flipping one attribute, and it is the
 * right tool for "fade this paragraph up once". It cannot do either of the two
 * things this section needs: a TIMELINE, where the figure, the masked title, the
 * copy and the CTA arrive in a deliberate order; and a SCRUB, where the figure's
 * drift is tied to scroll position rather than to an event.
 *
 * THE TORN EDGE IS NEVER ANIMATED. TornSurface warns about this and it is not a
 * theoretical concern: feTurbulence re-rasterises on every repaint, so moving a
 * filtered element re-runs the noise each frame. The divider is left completely
 * alone; everything below it moves instead.
 *
 * THE BRACKETS ARE NOT IN THIS SCENE EITHER, and that is a fix rather than an
 * omission — see the warning on `useGsapScene`. Tweening them wrote
 * `scale: none` and `translate: none` inline over BracketButton's own classes,
 * which un-mirrored the right bracket and killed the hover spread outright.
 * The CTA wrapper's fade and rise carry it into frame instead.
 *
 * TWO NESTED WRAPPERS ON THE FIGURE, and that is load-bearing. The entrance
 * animates the inner one's `y` and the scrub animates the outer one's. On a
 * single element the two tweens would fight over `transform` and whichever wrote
 * last would win — the same clash the gate has between Ken Burns and pointer
 * drift.
 */
const summonsScene: SceneBuilder = (gsap, q, section) => {
  const figure = q("[data-summons-figure]");
  const figureInner = q("[data-summons-figure-inner]");
  // The h2 INSIDE the mask, not the mask itself — the mask is the thing that
  // has to stay put while its child slides up out of it.
  const title = q("[data-summons-title] h2");
  const body = q("[data-summons-body]");
  const cta = q("[data-summons-cta]");
  const cue = q("[data-summons-cue]");

  gsap.matchMedia().add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { motion } = context.conditions as { motion: boolean };

      // Reduced motion gets the composed result and nothing else. Not a
      // faster version — no movement at all, per overview section 10.
      if (!motion) {
        gsap.set([figure, figureInner, title, body, cta, cue], {
          clearProps: "all",
        });
        return;
      }

      // ---- Entrance. Once, on the way down. ----
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          // Late enough that the section is genuinely arriving, early enough
          // that the title has finished by the time it is read.
          start: "top 72%",
          once: true,
        },
      });

      tl.from(figureInner, { yPercent: -14, opacity: 0, duration: 1.1 })
        .from(title, { yPercent: 110, duration: 0.9, ease: "power4.out" }, 0.15)
        .from(body, { y: 22, opacity: 0, duration: 0.75 }, 0.42)
        .from(cta, { y: 18, opacity: 0, duration: 0.6 }, 0.58)
        .from(cue, { y: 14, opacity: 0, duration: 0.5 }, 0.82);

      // ---- Parallax. Tied to scroll, not to time. ----
      // The figure hangs from the tear, so drifting it against the scroll
      // makes it read as suspended above the section rather than pasted into
      // it. Small on purpose: 90px over a whole section.
      gsap.fromTo(
        figure,
        { y: -45 },
        {
          y: 45,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            // A number, not `true`: the drift lags the scroll slightly, which
            // is what stops it feeling glued to the wheel.
            scrub: 0.6,
          },
        },
      );
    },
  );
};
