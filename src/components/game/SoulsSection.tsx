"use client";

import { useRef, useState } from "react";

import { CharacterCard } from "@/components/characters/CharacterCard";
import { CharacterModal, type RosterEntry } from "@/components/characters/CharacterModal";
import { BracketButton } from "@/components/ui/BracketButton";
import { Carousel } from "@/components/ui/Carousel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TornDivider } from "@/components/ui/TornDivider";
import { useGsapScene } from "@/hooks/useGsapScene";
import { rosterEntry } from "@/components/characters/roster-entry";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Character } from "@/types/character";

/**
 * SOULS OF THE ARENA - three of the roster on The Game page.
 *
 * THIS SECTION IS THE ROSTER'S WINDOW, NOT A LIST OF ITS OWN (the human,
 * 2026-09-22: "it is supposed to be connected to the character page … it seems
 * like it is independent"). The page hands it the same characters The
 * Characters page draws, and it shows the FIRST THREE in roster order - so
 * which three appear is the editor's `order`, set in /admin, and a character
 * switched off is never here either.
 *
 * Everything on a card is that character's own: portrait, framing, name and
 * alias, through the same `rosterEntry` the roster page uses. The card opens
 * the Characters page's own `CharacterModal`, and SEE FULL DETAILS in it goes
 * to `/characters/[slug]`.
 */
export function SoulsSection({
  characters,
  messages,
  locale,
}: {
  characters: readonly Character[];
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.theGame.souls;
  const roster = messages.characters.roster;
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<RosterEntry | null>(null);

  // The frame draws three cards, so the row takes the first three of the
  // roster. Fewer on the roster, fewer here; none, and the carousel is not
  // drawn at all and the section is its title, its line and the CTA.
  const cards = characters.slice(0, 3).map((character) => rosterEntry(character, locale));

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
        // faster version - no movement at all, per overview section 10.
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
    <section ref={root} className="relative overflow-x-clip">
      {/* The carousel track scrolls horizontally by design, inside its own
        scroller. This clips what sits OUTSIDE that - a card whose
        `w-[calc(100vw-3.4375rem)]` ran past the viewport at 768 and let the whole
        page scroll with it. `clip` rather than `hidden` for the same reason as the
        other two sections: it leaves the vertical axis alone. */}
      <TornDivider
        edge="top"
        seed={2274}
        className="text-bone relative z-10 -mb-px"
      />

      <div className="bg-bone pt-5.75 pb-20 md:pt-30 md:pb-34">
        <div className="mx-auto max-w-360 px-6 md:px-20">

          <div className="flex flex-col gap-1 md:flex-row-reverse md:items-start md:justify-between md:gap-16">

            <div data-souls-title className="overflow-hidden pb-1 md:-mt-7">
              <SectionTitle
                mutedAfter={t.titleMuted}
                mutedClassName="opacity-[0.58]"
                className="text-ink max-w-64 text-[4rem] leading-[1.03] tracking-[-0.084em] md:max-w-none md:text-[5.125rem] md:leading-[0.95]"
              >
                {t.title}
              </SectionTitle>
            </div>
            <p
              data-souls-intro
              className="text-ink/80 font-body text-body max-w-81"
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
          {cards.length ? (
          <Carousel
            label={t.title}
            className="mt-7.5 md:mt-23"
            trackClassName="-mx-6 gap-4 scroll-px-6 px-6 md:mx-0 md:scroll-px-0 md:px-0 lg:gap-[1.5625rem]"
            itemClassName="w-[calc(100vw-3.4375rem)] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3.125rem)/3)]"
          >
            {cards.map((card) => (
              <div data-souls-card key={card.href}>
                <CharacterCard
                  variant="roster"
                  name={card.name}
                  role={card.role}
                  image={card.image}
                  imageAlt={card.alt}
                  portraitClass={card.portraitClass}
                  figureClass={card.figureClass}
                  onSelect={() => setOpen(card)}
                />
              </div>
            ))}
          </Carousel>
          ) : null}

          <div
            data-souls-cta
            className="mt-12 flex justify-center md:mt-11 md:justify-end"
          >
            {/* Inverted for the light field: graphite fill, bone text, and the
                red brackets that come with `field="light"`.

                EXPLORE CHARACTERS → The Characters page, the frame's own CTA.
                It stood in as DOWNLOAD GAME from 2026-09-19 until the human
                asked for it back (2026-09-22): "the button shouldn't be
                download games, it should be explore characters which now takes
                you to the character page itself." The other CTAs on this page
                are unchanged. */}
            <BracketButton
              href={`/${locale}/characters`}
              field="light"
              className="bg-graphite text-bone px-8 py-[1.15rem] leading-none tracking-normal"
            >
              {t.cta}
            </BracketButton>
          </div>
        </div>
      </div>

      {open ? (
        <CharacterModal entry={open} cta={roster.modal.cta} closeLabel={roster.modal.close} onClose={() => setOpen(null)} />
      ) : null}
    </section>
  );
}
