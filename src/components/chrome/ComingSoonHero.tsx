"use client";

import Image from "next/image";
import { useRef } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import { TornPlate } from "@/components/ui/TornPlate";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import { usePointerDrift } from "@/hooks/usePointerDrift";
import { GATES } from "@/lib/gates";

/**
 * The Coming Soon hero: the first gate's plate under ink, and the copy centred
 * in what is left under the header. See `ComingSoon` for the frames.
 *
 * THE PLATE IS `gates/onu-uzo-1.png` AT THE SAME SIZE ON BOTH FRAMES — 1764 x 814
 * (cover for a 1440 x 814 hero), and the phone frame is a 360 x 735 window on
 * that same picture, not the picture shrunk to fit. So the plate's box is the
 * hero or 814px, whichever is taller, and it is cropped at the foot on a
 * short screen. Its arch stands off-centre in the file (53.6% across); the
 * `object-position` is `calc(53.1% - 3.6vw)`, which lands that column at the
 * hero's middle at ANY width — a percentage alone aligns the image's p% with
 * the box's p%, and a length moves the image (rightwards when positive), so
 * the vw term is the (p − 50)% of the box a bare percentage leaves over. Both
 * frames read the arch a few pixels right of centre (729 of 1440, 196 of 360),
 * hence 53.1 rather than 53.6. Darkened by `--color-ink` at 60%: the frames
 * measure 0.32–0.41 of the plate's luminance.
 *
 * THE COPY CENTRES in the space under the header's band (114 / 100 in the
 * frames). The phone frame is exactly that; the 1440 frame drew an 814 hero
 * with the footer under it, so with the hero a full screen the block sits
 * lower than that frame by half the footer's height — the phone's rule at
 * every width.
 *
 * THE CHIP IS THE Ọnụ Ụzọ CHIP'S PLATE at the label's width — `TornPlate`, as
 * BACK TO ỤZỌ draws it, since `Chip`'s plate is a fixed 96 x 30 and "PRIVACY
 * POLICY" needs 117 — and in its face, the grotesque, not the gates' Teko (the
 * frame draws it as BACK TO ỤZỌ does). The label is the footer link's text; the
 * frame's "THE PAGE TITLE" is its placeholder for exactly that.
 *
 * THE PARALLAX, per the human, is the site's two: motion moment 4's pointer
 * drift — the plate leans 1% against the cursor as the back layer and the copy
 * 3% as the front, the gates' depths (`usePointerDrift`: fine pointers only,
 * nothing under reduced motion) — and, on the way down to the footer, the
 * plate scrolling at six tenths of the page's speed (a scrubbed ScrollTrigger
 * moving it 40% of the distance scrolled), so the ground sits behind the copy
 * rather than on the same sheet. THREE WRAPPERS, ONE TRANSFORM EACH: the drift
 * writes `transform` on the outer plate box, the scroll tween owns the middle
 * one, and Ken Burns (the gates' breathing, CSS) the inner — GSAP and the
 * drift would otherwise overwrite each other's transform on the same element.
 * The plate slides down inside a box that is cropped by the hero, and the
 * strip it uncovers at the top has always scrolled off-screen already (it
 * grows at 40% of the scroll, the hero leaves at 100%).
 */
export function ComingSoonHero({
  pageTitle,
  title,
  body,
  cta,
  home,
}: {
  pageTitle: string;
  title: string;
  body: string;
  cta: string;
  /** Where BACK TO HOME goes — the portal. */
  home: string;
}) {
  const section = useRef<HTMLElement>(null);
  const { frontRef, backRef } = usePointerDrift<HTMLDivElement, HTMLDivElement>();
  useGsapScene(section, plateScene);

  return (
    <section ref={section} className="relative flex min-h-dvh flex-col overflow-hidden pt-25 lg:pt-[7.125rem]">
      {/* ---- The plate: the first gate's, leaning, lagging, breathing, under the ink ---- */}
      <div ref={backRef} aria-hidden className="absolute inset-x-0 top-0 h-[max(100%,50.875rem)] select-none">
        <div data-soon-plate className="absolute inset-0">
          <div className="ken-burns absolute inset-0">
            <Image
              src={GATES[0].plate}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[calc(53.1%-3.6vw)_top]"
            />
          </div>
        </div>
        <div className="bg-ink/60 absolute inset-0" />
      </div>

      {/* ---- The copy, centred in what is left under the header ---- */}
      <div ref={frontRef} className="relative flex flex-1 flex-col items-center justify-center px-6 pb-2.5 text-center lg:pb-0">
        <Reveal as="p" className="relative isolate">
          <span className="text-ink font-body text-caption relative isolate inline-grid h-7.5 place-items-center px-4 leading-none font-semibold uppercase">
            <TornPlate className="text-gild" />
            {pageTitle}
          </span>
        </Reveal>
        <Reveal as="h1" delay={60} className="font-display text-menu-fg text-game-hero mt-2 font-semibold tracking-[-0.058em] uppercase lg:mt-4 lg:tracking-[-0.076em]">
          {title}
        </Reveal>
        <Reveal as="p" delay={120} className="text-menu-fg font-body text-body mt-4 max-w-[15.5rem] lg:max-w-72">
          {body}
        </Reveal>
        <Reveal delay={180} className="mt-9">
          <BracketButton href={home} className="px-4.5 py-[1.15rem] leading-none tracking-normal">
            {cta}
          </BracketButton>
        </Reveal>
      </div>
    </section>
  );
}

/** The plate lags the scroll: 40% of the distance the hero travels, scrubbed. */
const plateScene: SceneBuilder = (gsap, q, section) => {
  const plate = q("[data-soon-plate]")[0] as HTMLElement | undefined;
  if (!plate) return;

  gsap.matchMedia().add(
    { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
    (ctx) => {
      if ((ctx.conditions as { reduced: boolean }).reduced) {
        gsap.set(plate, { clearProps: "transform" });
        return;
      }
      gsap.fromTo(
        plate,
        { y: 0 },
        {
          y: () => section.offsetHeight * 0.4,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
        },
      );
    },
  );
};
