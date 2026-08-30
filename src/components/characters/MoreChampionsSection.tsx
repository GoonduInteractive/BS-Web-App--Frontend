"use client";

import Image from "next/image";
import { useRef } from "react";

import { ScrollCue } from "@/components/gates/ScrollCue";
import { BracketButton } from "@/components/ui/BracketButton";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";

export function MoreChampionsSection({
  messages,
  nextHref,
}: {
  messages: Messages;
  nextHref: string;
}) {
  const t = messages.characters.more;
  const root = useRef<HTMLElement>(null);

  useGsapScene(root, moreScene);

  return (
    <section ref={root} className="relative overflow-hidden">

      <div
        data-more-plate
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 select-none lg:inset-auto lg:top-0 lg:left-[-2.78%] lg:aspect-4320/2857 lg:w-[104.2%] lg:opacity-100"
      >
        <Image
          src="/assets/character/more-champion.png"
          alt=""
          fill
          sizes="(max-width: 1023px) 260vw, 105vw"
          className="object-cover object-[58%_55%] lg:object-fill"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-360 px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* ---- Left: glyph strip, heading, CTA ---- */}
          <div className="relative pt-24 lg:pt-[20%] lg:pl-[25%]">

            <Image
              data-more-glyphs
              src="/assets/ornaments/nsibidi-glyphs-3.svg"
              alt=""
              aria-hidden
              width={28}
              height={227}
              className="pointer-events-none absolute top-[12.75rem] left-[13.47%] hidden h-[14.125rem] w-[1.75rem] select-none lg:block"
            />

            <h2
              data-more-title
              className="font-display text-roster-heading text-story-title leading-[0.87] font-semibold tracking-[-0.056em] uppercase"
            >
              {t.titleLines.map((line) => (

                <span key={line} className="block overflow-hidden">
                  <span className="more-line block">{line}</span>
                </span>
              ))}
            </h2>

            <div data-more-cta className="mt-16 lg:mt-[13.47%]">
              <BracketButton className="px-4 py-[1.1875rem] leading-none tracking-normal whitespace-nowrap">
                {t.cta}
              </BracketButton>
            </div>
          </div>

          <div className="pt-12 pb-24 lg:pt-[89.17%] lg:pb-[20%] lg:pl-[40.97%]">
            <p
              data-more-body
              className="text-menu-fg/85 font-body text-body max-w-[28rem] lg:w-[40.56%] lg:max-w-none lg:min-w-60"
            >
              {t.body}
            </p>
          </div>
        </div>
      </div>

      <div data-more-cue className="relative z-10 flex justify-center pt-4 pb-20 lg:pt-[7.15%] lg:pb-[9.44%]">
        <ScrollCue href={nextHref} label={t.cue} />
      </div>
    </section>
  );
}

const moreScene: SceneBuilder = (gsap, q, section) => {
  const plate = q("[data-more-plate]");
  const lines = q("[data-more-title] .more-line");
  const rest = [...q("[data-more-glyphs]"), ...q("[data-more-cta]"), ...q("[data-more-body]"), ...q("[data-more-cue]")];

  gsap.matchMedia().add(
    { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
    (context) => {
      const { motion } = context.conditions as { motion: boolean };

      if (!motion) {
        gsap.set([plate, lines, rest], { clearProps: "all" });
        return;
      }

      gsap
        .timeline({ scrollTrigger: { trigger: section, start: "top 70%", once: true } })
        .from(lines, { yPercent: 110, duration: 1, ease: "power3.out", stagger: 0.1 })
        .from(rest, { y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, immediateRender: false }, 0.35);

      gsap.fromTo(
        plate,
        { yPercent: 3 },
        {
          yPercent: -3,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.8 },
        },
      );
    },
  );
};