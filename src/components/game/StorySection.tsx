"use client";

import Image from "next/image";
import { useRef } from "react";

import { DownloadGameButton } from "@/components/ui/DownloadGameButton";
import { Chip } from "@/components/ui/Chip";
import { TornDivider } from "@/components/ui/TornDivider";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";

export function StorySection({ messages }: { messages: Messages }) {
  const t = messages.theGame.story;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, storyScene);

  return (
    <section ref={root} className="bg-oxblood relative overflow-x-clip">
      {/* `overflow-x-clip` IS THE ONLY VALUE THAT WORKS HERE, and the reason is in
        the note above: this section owns BOTH its edges and the top tear hangs
        ABOVE the box, so the box must not clip vertically. Soma is laid at
        137.4vw on a phone and overflowed the viewport, letting the page scroll
        sideways. `overflow-hidden` on one axis forces the other to become a scroll
        container, which would have cut the tear off; `clip` does not. */}
      {/* Top edge, hung above the box so its teeth bite into the hero plate. */}
      <TornDivider
        edge="top"
        seed={3120}
        className="text-oxblood absolute inset-x-0 -top-6 z-20"
      />

      {/* Mirrored glyph columns. */}
      <Image
        src="/assets/ornaments/nsibidi-glyphs-1.svg"
        alt=""
        aria-hidden
        width={77}
        height={359}
        data-story-glyphs
        className="absolute top-25.25 left-24.75 hidden w-19.25 select-none lg:block"
      />
      <Image
        src="/assets/ornaments/nsibidi-glyphs-1.svg"
        alt=""
        aria-hidden
        width={77}
        height={359}
        data-story-glyphs
        className="absolute top-44.25 right-24.75 hidden w-19.25 select-none lg:block"
      />

      {/*
        Soma. Absolute at both widths, because at both widths he is a backdrop. */}

      <div className="pointer-events-none absolute -bottom-10 left-1/2 w-[137.4vw] -translate-x-1/2 md:-bottom-10.25 md:w-173">
        <div data-story-figure>
          <div data-story-figure-inner>
            <Image
              src="/assets/characters/soma-gate-character.png"
              alt={t.characterAlt}
              width={4096}
              height={4096}
              sizes="(max-width: 767px) 138vw, 692px"
              className="w-full select-none"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-254.5 px-6 pt-20.75 pb-114 md:px-0 md:pt-33.75 md:pb-72">
        <header
          data-story-head
          className="flex flex-col items-start text-left md:items-center md:text-center"
        >
          <Chip>{t.chip}</Chip>

          <h2 className="font-display text-menu-fg text-story-title mt-4.5 max-w-158 md:mt-6 font-semibold tracking-[-0.056em] uppercase">
            {t.title}
          </h2>
        </header>

        <div className="md:grid md:grid-cols-[17rem_1fr_15.875rem]">
          <div data-story-copy className="mt-8.5 md:mt-22.25">
            <p className="text-menu-fg/80 font-body text-body">{t.body1}</p>
            <p className="text-menu-fg/80 font-body text-body mt-6.25">
              {t.body2}
            </p>
          </div>

          {/* Soma's lane. Empty on purpose — he is absolute, and this is the
              column the frame reserves for him. */}
          <div aria-hidden className="hidden md:block" />

          <div data-story-aside className="mt-6.25 md:mt-59.75">
            <p className="text-menu-fg/80 font-body text-body">{t.aside}</p>

            <div
              data-story-cta
              className="absolute inset-x-0 bottom-16.75 flex justify-center pr-8 md:static md:mt-15.25 md:justify-start md:pr-0"
            >
              {/* JOIN THE TRIAL, for now DOWNLOAD GAME (2026-09-19). */}
              <DownloadGameButton label={messages.site.downloadCta} className="text-body px-4.5 leading-none tracking-[0.04em]" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom edge, in the next field's colour, laid over Soma's waist. */}
      <TornDivider
        edge="top"
        seed={7714}
        className="text-char absolute inset-x-0 bottom-0 z-20"
      />
    </section>
  );
}

const storyScene: SceneBuilder = (gsap, q, section) => {
  const figure = q("[data-story-figure]");
  const figureInner = q("[data-story-figure-inner]");
  const head = q("[data-story-head]");
  const copy = q("[data-story-copy]");
  const aside = q("[data-story-aside] p");
  const cta = q("[data-story-cta]");
  const glyphs = q("[data-story-glyphs]");

  gsap.matchMedia().add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { motion } = context.conditions as { motion: boolean };

      // Reduced motion gets the composed result and nothing else. Not a slower
      // version — no movement at all, per overview section 10.
      if (!motion) {
        gsap.set([figure, figureInner, head, copy, aside, cta, glyphs], { clearProps: "all" });
        return;
      }

      // ---- Entrance. Once, on the way down. ----
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      });

      // Soma leads, and he arrives from BELOW the tear — the same direction the
      // scrub then keeps pushing him. Everything else settles onto a figure that
      // is already coming up.
      tl.from(figureInner, { yPercent: 9, opacity: 0, duration: 1.2 })
        .from(head, { y: 26, opacity: 0, duration: 0.8 }, 0.1)
        .from(glyphs, { opacity: 0, duration: 1.1 }, 0.2)
        .from(copy, { y: 22, opacity: 0, duration: 0.75 }, 0.38)
        .from(aside, { y: 22, opacity: 0, duration: 0.75 }, 0.52)
        .from(cta, { y: 18, opacity: 0, duration: 0.6 }, 0.66);

      // ---- The rise. Tied to scroll, not to time. ----
      gsap.fromTo(
        figure,
        { y: 65 },
        {
          y: -65,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );

      gsap.fromTo(
        glyphs,
        { y: -13 },
        {
          y: 13,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    },
  );
};
