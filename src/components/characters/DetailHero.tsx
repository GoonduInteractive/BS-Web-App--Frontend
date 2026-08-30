"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import { castCopy, type Character } from "@/lib/characters";
import { TornDivider } from "@/components/ui/TornDivider";
import { TornPlate } from "@/components/ui/TornPlate";
import type { Messages } from "@/lib/utils/messages";

export function DetailHero({
  character,
  messages,
  backHref,
}: {
  character: Character;
  messages: Messages;
  backHref: string;
}) {
  const t = messages.characters.detail;
  const cast = castCopy(messages, character.castKey);
  const detail = cast.detail;
  const root = useRef<HTMLElement>(null);

  useGsapScene(root, heroScene);

  return (
    <section
      ref={root}
      className="bg-detail-hero relative overflow-hidden pb-28 lg:pb-0"
    >
      {/* The figure. Anchored to the bottom and cropped by the tear, as the
          frame draws it — it is scenery, so it sits behind everything and takes
          no part in the reading order. */}
      <div
        data-hero-figure
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center lg:inset-y-0 lg:items-end"
      >
        <div className="relative h-136 w-full max-w-228 lg:h-full">
          <Image
            src={character.image}
            alt={cast.alt}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 57rem"
            className="object-cover object-top opacity-40 lg:opacity-100"
          />
        </div>
      </div>

      {/* The marks the frame stacks at x78, y315..455 — decorative, and the
          one delivered vertical glyph strip is exactly this shape. Dimmed
          because the frame draws them barely above the field. */}
      <Image
        src="/assets/ornaments/nsibidi-glyphs-1.svg"
        alt=""
        aria-hidden
        width={28}
        height={227}
        className="pointer-events-none absolute top-78.75 left-19.5 hidden h-35 w-auto opacity-100 lg:block"
      />

      {/* THE DESIGNED SPLIT STARTS AT `lg`, AND ITS OFFSETS ARE PROPORTIONS.
          The frame pads 160 left and 125 right of 1440 and gives the aside a 340
          track. Held as literal pixels behind `md` that left 143px of a 768
          screen for a name set at 160px, and the aside landed on top of the
          figure. 11.11%, 8.68% and 23.6% are those same numbers over 1440, and
          they are applied inside the cap so they stop growing past it. */}
      <div className="relative z-10 mx-auto w-full max-w-360">
       <div className="grid grid-cols-1 gap-16 px-6 pt-32 pb-16 lg:grid-cols-[minmax(0,1fr)_23.6%] lg:gap-0 lg:pt-56.75 lg:pr-[8.68%] lg:pb-28 lg:pl-[11.11%]">
        <div>
          <div data-hero-item className="lg:-ml-18">
            <BackChip href={backHref} label={t.back} />
          </div>

          <span className="mt-29.25 block overflow-hidden pb-[0.08em]">
            <h1
              data-hero-name
              className="font-display text-menu-fg text-detail-name block leading-none font-semibold tracking-[-0.055em] uppercase"
            >
              {cast.name}
            </h1>
          </span>

          <p
            data-hero-item
            className="font-display text-menu-fg text-h3 mt-5.75 leading-none font-semibold tracking-[-0.02em] uppercase"
          >
            {cast.role}
          </p>
          <div data-hero-rule className="mt-12.25 w-full max-w-87.25 origin-left">
            <Image
              src="/assets/ornaments/Arrow-border-hero.svg"
              alt=""
              aria-hidden
              width={349}
              height={11}
              className="h-2.75 w-full object-fill"
            />
          </div>

          <dl data-hero-item className="mt-7 flex gap-13">
            <Stat label={t.roleLabel} value={detail.stats.role} mark="role" />
            <Stat label={t.difficultyLabel} value={detail.stats.difficulty} mark="difficulty" />
          </dl>
        </div>

        <div data-hero-item className="flex flex-col gap-6.25 lg:pt-23.75">
          {detail.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-menu-fg/85 font-body text-body">
              {paragraph}
            </p>
          ))}
        </div>
       </div>
      </div>

      <TornDivider
        edge="top"
        seed={5140}
        className="text-roster-top absolute inset-x-0 bottom-0 z-20"
      />
    </section>
  );
}

function BackChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-ink font-body focus-visible:outline-signal text-caption relative isolate inline-flex h-7.5 items-center gap-2.5 px-4 leading-none font-semibold transition-opacity duration-150 ease-gate hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <TornPlate className="text-gild" />
      <svg
        aria-hidden
        viewBox="0 0 14 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        className="h-3 w-3.5 shrink-0"
      >
        <path d="M13.2 6H1M1 6 6 1M1 6 6 11" />
      </svg>
      {label}
    </Link>
  );
}

/**
 * One stat: a caption label over a gild tile carrying its nsibidi mark, and the
 * value beside it.
 *
 * THE MARKS ARE SOMA'S, ON EVERY CHARACTER,
 *  the individual glyphs the earlier sheets could not provide, which is why
 * this tile shipped bare until now. Each character will eventually get marks of
 * their own; until those arrive these two stand for all nine, so they are named
 * by the STAT rather than by the character and nothing here is per-character.
 */
const STAT_MARK = {
  role: "/assets/ornaments/nisibidi-role.svg",
  difficulty: "/assets/ornaments/nisibi-difficult.svg",
} as const;

function Stat({
  label,
  value,
  mark,
}: {
  label: string;
  value: string;
  mark: keyof typeof STAT_MARK;
}) {
  return (
    <div>
      <dt className="text-menu-fg/70 font-body text-caption tracking-[0.08em] uppercase">{label}</dt>
      <dd className="mt-3 flex items-center gap-3.5">
        <span className="bg-gild grid h-11 w-11 shrink-0 place-items-center">
          <Image
            src={STAT_MARK[mark]}
            alt=""
            aria-hidden
            width={30}
            height={30}
            className="h-5.5 w-5.5 object-contain"
          />
        </span>
        <span className="font-display text-menu-fg text-h6 max-w-28 leading-[1.1] font-semibold uppercase">
          {value}
        </span>
      </dd>
    </div>
  );
}

/**
 * The hero's entrance — the first beat of the page's cinematic run.
 *
 * The name is the anchor: it comes up from under its own baseline with the mask
 * clipping it, so it reads as rising into frame rather than sliding. Everything
 * else follows it in, and the figure settles last and slowest, which is what
 * gives the sequence its depth.
 *
 * NOT SCROLL-TRIGGERED. This section is at the top of the page and is already in
 * view on arrival, so it plays once on mount. The sections below it are the ones
 * that key off scroll.
 */
const heroScene: SceneBuilder = (gsap, q) => {
  const media = gsap.matchMedia();

  media.add(
    { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
    (context) => {
      const { reduced } = context.conditions as { reduced: boolean };

      // REDUCED MOTION GETS THE CONTENT, NEVER THE MOVEMENT. Everything is set
      // to its resting state and nothing is tweened.
      if (reduced) {
        gsap.set([q("[data-hero-name]"), q("[data-hero-item]"), q("[data-hero-rule]"), q("[data-hero-figure]")], {
          clearProps: "all",
        });
        return;
      }

      // EVERY TWEEN CLEARS ITS OWN PROPS ON COMPLETION. The scene is rebuilt
      // whenever the section is relaid out, and without this the inline
      // opacity and transform GSAP writes survive into the next build, so a
      // resize mid-timeline could strand the hero part-faded. Cleared, the
      // resting state is whatever the CSS says, which is fully visible.
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", clearProps: "opacity,transform" },
      });

      timeline
        .from(q("[data-hero-figure]"), { opacity: 0, scale: 1.06, duration: 1.6, ease: "power2.out" })
        .from(q("[data-hero-name]"), { yPercent: 110, duration: 1.1 }, 0.15)
        .from(q("[data-hero-item]"), { y: 24, opacity: 0, duration: 0.8, stagger: 0.09 }, 0.4)
        .from(q("[data-hero-rule]"), { scaleX: 0, duration: 0.9, clearProps: "transform" }, 0.55);
    },
  );
};
