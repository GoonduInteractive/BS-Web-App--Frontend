"use client";

import { useRef } from "react";

import { CharacterCard } from "@/components/characters/CharacterCard";
import { BracketButton } from "@/components/ui/BracketButton";
import { Carousel } from "@/components/ui/Carousel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TornDivider } from "@/components/ui/TornDivider";
import { useGsapScene } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";

/**
 * Section 5 — Souls of the Arena. Figma:
 * `context/design/03-the-game/section-4.png`.
 *
 * The only light field on the site, torn top and bottom against the dark ground
 * either side. Three character cards, intro copy left, heading right.
 *
 * WHAT THE FRAME MEASURES, at 1440:
 *
 *   intro    x  94..416   y 183..269   four lines at 16/25
 *   title    x 884..1350  y 177..228   cap 52 -> 82px
 *   cards    x  78..488 / 513..923 / 948..1358, y 361..874   411 x 514, gap 25
 *   CTA box  x 1106..1329 y 940..995   (224 x 56)
 *   brackets x 1078 and 1347
 *
 * So the content box is 78..1358 — full-bleed with 80px side padding, which is
 * what the cards align to. The old centred `max-w-[86rem] px-13.5` put it at 86.
 *
 * THE CTA IS DARK HERE, AND THAT IS THE POINT. Every other button on the site is
 * signal red on a near-black plate; on the bone field the frame shows a black
 * button with white text AND the red brackets, which is what `field="light"`
 * selects. That is the first concrete answer to overview risk 1 (dark-surface
 * button variants), though it is an inversion of Primary rather than the
 * Secondary or Tertiary the sheet describes. Worth confirming.
 *
 * FLAGGED: --color-bone (#E5DEB5) is a sampled value, and this is the whole
 * field, so it is the most visible unconfirmed colour on the page.
 */
export function SoulsSection({ messages }: { messages: Messages }) {
  const t = messages.theGame.souls;
  const root = useRef<HTMLElement>(null);

  const cards = [
    { ...t.soma, image: "/assets/characters/soma-gate-character.png" },
    { ...t.kaira, image: "/assets/characters/kaira-crop.png" },
    { ...t.ogbunabali, image: "/assets/characters/ogbunabali.png" },
  ];

  useGsapScene(root, (gsap, q, section) => {
    const title = q("[data-souls-title] h2");
    const intro = q("[data-souls-intro]");
    const cardEls = q("[data-souls-card]");
    const cta = q("[data-souls-cta]");

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
          gsap.set([title, intro, ...cardEls, cta], { clearProps: "all" });
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        });

        tl
          // Masked by its overflow-hidden parent, so it rises INTO the frame
          // rather than sliding over it. Same gesture as Answer the Summons.
          .from(title, { yPercent: 115, duration: 0.85, ease: "power4.out" })
          .from(intro, { y: 20, opacity: 0, duration: 0.6 }, 0.12)
          // The roster deals itself out left to right. The cards rise a little
          // further than the copy and overlap by two thirds, so it reads as one
          // movement with three beats rather than three separate animations.
          .from(
            cardEls,
            {
              y: 56,
              opacity: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: "power3.out",
            },
            0.2,
          )
          .from(cta, { y: 16, opacity: 0, duration: 0.5 }, 0.62);
      },
    );
  });

  return (
    <section ref={root} className="relative">
      <TornDivider
        edge="top"
        seed={2274}
        className="text-bone relative z-10 -mb-px"
      />

      <div className="bg-bone pt-[1.4375rem] pb-20 md:pt-[7.5rem] md:pb-[8.5rem]">
        <div className="mx-auto max-w-[90rem] px-6 md:px-20">
          {/*
            The heading comes FIRST in the DOM because that is the mobile order
            in full-page-mobile.png: heading, then the intro beneath it. On
            desktop the frame puts the intro on the left and the heading on the
            right, which `md:flex-row-reverse` gives without reordering the
            markup or hurting the reading order.
          */}
          <div className="flex flex-col gap-1 md:flex-row-reverse md:items-start md:justify-between md:gap-16">
            {/* The mask the title rides up out of. `pb-1` keeps descenders and
                the tracking overhang from being clipped at rest. */}
            <div data-souls-title className="overflow-hidden pb-1 md:-mt-7">
              <SectionTitle
                mutedAfter={t.titleMuted}
                // 58% ink over bone in the frame, against the shared 45% default.
                mutedClassName="opacity-[0.58]"
                // 64px on a 66 pitch at 361, breaking after THE — the frame
                // sets this title over two lines on mobile and one on desktop,
                // so the max-width IS the line break and not a safety margin.
                className="text-ink max-w-64 text-[4rem] leading-[1.03] tracking-[-0.084em] md:max-w-none md:text-[5.125rem] md:leading-[0.95]"
              >
                {t.title}
              </SectionTitle>
            </div>
            <p
              data-souls-intro
              className="text-ink/80 font-body text-body max-w-[20.25rem]"
            >
              {t.intro}
            </p>
          </div>

          {/*
            A CAROUSEL AT EVERY WIDTH, which is what the 361 frame shows: one
            card at 306 with the next peeking 15px past the right edge, not a
            stack. At `lg` the same track holds all three at the frame's 411 and
            simply has nothing left to scroll, so it reads as the designed row.

            THE TRACK BREAKS OUT OF THE PAGE GUTTER on mobile (`-mx-6 px-6`) so
            the peek can reach the viewport edge, and `scroll-px-6` puts the
            snap line back on the gutter rather than on the breakout.

            Slide width is the frame's arithmetic, not a round number:
            100vw less the 24px gutter, the 16px gap and the 15px peek.
          */}
          <Carousel
            label={t.title}
            className="mt-[1.875rem] md:mt-[5.75rem]"
            trackClassName="-mx-6 gap-4 scroll-px-6 px-6 md:mx-0 md:scroll-px-0 md:px-0 lg:gap-[1.5625rem]"
            itemClassName="w-[calc(100vw-3.4375rem)] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3.125rem)/3)]"
          >
            {cards.map((card) => (
              // A WRAPPER, NOT THE CARD. GSAP normalises `translate`, `scale`
              // and `rotate` onto its own transform and writes them `none`
              // inline, which would kill the portrait's `group-hover:scale-105`.
              // Tweening one level up leaves the card's own CSS untouched.
              <div data-souls-card key={card.name}>
                <CharacterCard
                  name={card.name}
                  role={card.role}
                  image={card.image}
                  imageAlt={card.name}
                />
              </div>
            ))}
          </Carousel>

          <div
            data-souls-cta
            className="mt-12 flex justify-center md:mt-[2.75rem] md:justify-end"
          >
            {/* Inverted for the light field: graphite fill, bone text, and the
                red brackets that come with `field="light"`. */}
            <BracketButton
              field="light"
              className="bg-graphite text-bone px-8 py-[1.15rem] leading-none tracking-normal"
            >
              {t.cta}
            </BracketButton>
          </div>
        </div>
      </div>

      {/* No bottom edge here. Answer the Summons draws the bone tearing into
          its own top, because the frame has that tear cutting across the
          ascendant — which only works if the divider is stacked above it. */}
    </section>
  );
}
