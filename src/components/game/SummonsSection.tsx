"use client";

import Image from "next/image";
import { useRef } from "react";

import { ScrollCue } from "@/components/gates/ScrollCue";
import { BracketButton } from "@/components/ui/BracketButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TornDivider } from "@/components/ui/TornDivider";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";

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

      <TornDivider
        edge="bottom"
        seed={4102}
        className="text-bone absolute inset-x-0 -top-2 z-20"
      />

      <div className="relative mx-auto max-w-360 px-6 md:px-40">

        <div
          data-summons-figure
          className="ml-[50%] w-[189vw] max-w-none -translate-x-1/2 md:absolute md:-top-14 md:-right-41 md:z-0 md:ml-0 md:w-282 md:translate-x-0"
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

        <div className="relative z-10 pt-10 pb-16 md:pt-51.25 md:pb-42">

          <div data-summons-title className="overflow-hidden pb-1">
            <SectionTitle className="text-menu-fg text-[3rem] leading-[0.95] tracking-[-0.066em] md:text-[4.8125rem]">
              {t.title}
            </SectionTitle>
          </div>

          <p
            data-summons-body
            className="text-menu-fg/85 font-body text-body mt-[1.15rem] max-w-108 whitespace-pre-line"
          >
            {t.body}
          </p>

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

/* The section's entrance and its parallax. */
const summonsScene: SceneBuilder = (gsap, q, section) => {
  const figure = q("[data-summons-figure]");
  const figureInner = q("[data-summons-figure-inner]");
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
