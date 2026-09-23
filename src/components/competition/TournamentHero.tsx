"use client";

import Image from "next/image";

import { RegisterFlow } from "@/components/competition/RegisterFlow";
import { Scene } from "@/components/competition/Scene";
import { GateReturn } from "@/components/gates/GateReturn";
import { Reveal } from "@/components/motion/Reveal";
import { usePointerDrift } from "@/hooks/usePointerDrift";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Tournament } from "@/types/tournament";

/**
 * The tournament detail page's hero. Figma:
 * `context/design/06-competition/Tournament (upcoming).png` and
 * `Tournament details page ongoing.png`, y 0..678 at 1440 - identical in both.
 *
 * THE COMPETITION HERO'S GROUND AND GEOMETRY, with Nze Ugwuoke where the two
 * Somas were. Same gradient (the corner reads #44 against the competition
 * hero's #4a, the same fill on a box of the same size), same 108 content edge,
 * same chip position, same title token; the render is the featured card's
 * `nze.png`.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   chip     93..275 x 227..256 - BACK TO TOURNAMENTS, a link back to the page
 *   title    ink 112..548, two lines, cap 63 at 297 and 377 → --text-game-hero
 *   body     ink 111..595, four lines at a 25 pitch from 474 - the card's copy
 *   CTA      red 1025..1297 x 514..568, brackets at 997 and 1314; ends 8 short
 *            of the 1332 content edge, level with the body's foot
 *   render   nze.png at 1.02 → 644 x 602 at (740, 108), bottom 32 past the
 *            hero's 678 - under the next section's tear, as the Somas are
 *
 * FULL VIEWPORT HEIGHT, as the competition hero. The render is bottom-anchored
 * for the same reason its figures are: its canvas cuts it at the knee and the
 * tear that follows is what hides the cut.
 *
 * THE PHONE FRAME (`tornament-mobilee.png`, 360 wide) is its own composition:
 * chip at 136, title 52 under it, the copy in a 320 box, and the render AT THE
 * SAME 1.02 SCALE AS THE DESKTOP - solved by compositing, error 9.4 - a 644 x
 * 602 box at (−112, 524), so it runs off both sides and 75 past the hero's
 * foot, where the tear cuts it at the mask. The CTA sits OVER the render, the
 * bracket group centred, its red 78 above the foot. Below `lg` the stage is
 * the render's visible 527 (146.4cqw) and the CTA is absolute against the
 * hero; from `lg` it is the grid cell the desktop frame gives it.
 *
 * THE CTA IS THE REGISTRATION FLOW where registration is open - the same two
 * sheets the featured card opens, so a tournament page registers the same way
 * the card does. For a running or announced tournament there is nothing to
 * register for, so no CTA is drawn; the ongoing frame still shows REGISTER FOR
 * TOURNAMENT over a card it calls REGISTRATION OPEN, which is the featured
 * card's data pasted in. FLAGGED.
 */
export function TournamentHero({
  tournament,
  messages,
  locale,
}: {
  tournament: Tournament;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.competition;
  const copy: { name: string; description?: string } =
    t.tournaments[tournament.copyKey as keyof typeof t.tournaments];
  const { backRef } = usePointerDrift<HTMLDivElement, HTMLDivElement>();
  const canRegister = tournament.status === "registrationOpen" || tournament.status === "open";

  return (
    <section className="bg-competition-hero relative flex min-h-dvh flex-col overflow-hidden">
      <div className="@container relative mx-auto flex w-full flex-1 flex-col">
        {/* Copy at the top-left, the CTA at the bottom-right: in the frame's 678
            hero they are level; in a full-height one the copy keeps the chip at
            227 and the CTA keeps its 110 from the foot. */}
        <div className="flex flex-1 flex-col px-5 pt-34 pb-1.5 lg:relative lg:z-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:px-27 lg:pt-56.75 lg:pb-27.5">
          <div className="lg:self-start">
            <Reveal className="lg:-ml-4">
              <GateReturn label={t.detail.backToTournaments} href={`/${locale}/competition`} />
            </Reveal>

            {/* 36rem breaks WRATH OF NZE / UGWUOKE at this size, as the frame
                does; the token's 80 pitch is the frame's 80. */}
            <Reveal
              as="h1"
              className="font-display text-menu-fg text-game-hero mt-13 max-w-144 font-semibold tracking-[-0.058em] uppercase lg:mt-10"
            >
              {copy.name}
            </Reveal>

            {/* The featured card's description at its 512 box, so the four
                lines break where they did there and where the frame does. */}
            {copy.description ? (
              <Reveal delay={80} className="mt-5 max-w-128 lg:mt-2.5">
                <p className="text-menu-fg font-body text-body">{copy.description}</p>
              </Reveal>
            ) : null}
          </div>

          {canRegister ? (
            <Reveal
              delay={160}
              className="absolute inset-x-0 bottom-[4.875rem] z-10 flex justify-center lg:static lg:mr-2 lg:block lg:self-end lg:justify-self-end"
            >
              <RegisterFlow
                tournament={tournament}
                messages={messages}
                locale={locale}
                profileHref={`/${locale}/profile`}
                label={t.detail.register}
                tone="signal"
                field="dark"
              />
            </Reveal>
          ) : null}
        </div>

        {/* 1 frame px is 1/14.4 cqw at lg; below it the render sits under the
            copy at the phone frame's size, 300 wide against the right edge. */}
        <div
          ref={backRef}
          aria-hidden
          className="pointer-events-none relative mt-auto h-[146.4cqw] select-none [--fx:0.069444cqw] lg:absolute lg:inset-0 lg:h-auto"
        >
          {/* The render arrives from the right on mount - the `heroFigure`
              scene - on this wrapper, which the drift layer above carries. */}
          <Scene
            scene="heroFigure"
            className="absolute bottom-[-20.8cqw] left-[-31.1cqw] w-[178.9cqw] lg:bottom-[calc(-32*var(--fx))] lg:left-[calc(740*var(--fx))] lg:w-[calc(644*var(--fx))]"
          >
            <Image
              src="/assets/competition/nze.png"
              alt=""
              width={631}
              height={590}
              sizes="(min-width: 1024px) 45vw, 90vw"
              // The page's LCP image: no gate in front of this hero.
              priority
              className="h-auto w-full"
            />
          </Scene>
        </div>
      </div>
    </section>
  );
}
