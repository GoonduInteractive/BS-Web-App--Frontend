"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { CharacterCard } from "@/components/characters/CharacterCard";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import { rosterEntry } from "@/components/characters/roster-entry";
import { actionTileClass, galleryClass, withName } from "@/lib/characters";
import type { Messages } from "@/lib/utils/messages";
import type { Character } from "@/types/character";

export function DetailBody({
  character,
  others,
  messages,
  locale,
}: {
  character: Character;
  /** Everyone else on the roster, in roster order; the row takes the first three. */
  others: readonly Character[];
  messages: Messages;
  locale: string;
}) {
  const t = messages.characters.detail;
  const root = useRef<HTMLElement>(null);

  const row = others.slice(0, 3);

  useGsapScene(root, bodyScene);

  return (
    <section ref={root} className="bg-roster relative">
      {/* THE PADDING IS A PERCENTAGE INSIDE THE CAP, NOT OUTSIDE IT. The frame
          insets this content 190 of 1440, which is 13.19%. Put on the capped
          element the percentage would resolve against the VIEWPORT above 1440
          and keep growing, squeezing the content narrower the wider the screen
          got. Capping first and padding within holds 190 from 1440 up and scales
          it down below. */}
      <div className="mx-auto w-full max-w-360">
       <div className="px-6 lg:px-[13.19%]">
        <Block heading={withName(t.loreHeading, character.name)} className="pt-28 lg:pt-58">
          <div className="flex flex-col gap-6.25">
            {character.lore.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} data-rise className="text-menu-fg/85 font-body text-body">
                {paragraph}
              </p>
            ))}
          </div>
        </Block>

        <Block heading={t.abilitiesHeading} className="pt-28 lg:pt-41.75">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-15 sm:grid-cols-2 lg:grid-cols-3">
            {character.abilities.map((ability) => (
              <li key={ability.name} data-rise>

                <div className="bg-menu relative aspect-144/130 w-full max-w-36 overflow-hidden">
                  <Image
                    src={character.action}
                    alt=""
                    aria-hidden
                    fill
                    sizes="9rem"
                    className={actionTileClass(character.action)}
                  />
                </div>
                <h3 className="font-display text-menu-fg text-h6 mt-9.5 leading-none font-semibold tracking-[-0.02em] uppercase">
                  {ability.name}
                </h3>
                <p className="text-menu-fg/85 font-body text-body mt-6 max-w-54">{ability.text}</p>
              </li>
            ))}
          </ul>
        </Block>

        {/* Only Nze's document has forms (Staff / Axe). Where there are none the
            section is not drawn — the frame's slot, empty, rather than filled. */}
        {character.variants.length ? (
          <Block heading={t.variantsHeading} className="pt-28 lg:pt-46">
            <div className="flex flex-col gap-13">
              {character.variants.map((variant) => (
                <div key={variant.name} data-rise>
                  <h3 className="font-display text-menu-fg text-h6 leading-none font-semibold tracking-[-0.02em] uppercase">
                    {variant.name}
                  </h3>
                  <p className="text-menu-fg/85 font-body text-body mt-6 max-w-152">{variant.text}</p>
                </div>
              ))}
            </div>
          </Block>
        ) : null}

        {/* The gallery and OTHER CHAMPIONS break out of the two-column split. */}
        <div className="pt-28 lg:pt-46">
          <Heading>{withName(t.galleryHeading, character.name)}</Heading>

          {/* One plate per delivered picture — two or three, see the manifest. */}
          <ul className="mt-14 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:mt-26.25">
            {character.gallery.map((plate, i) => (
              <li key={`${i}-${plate}`} data-gallery className="bg-menu relative aspect-336/453 overflow-hidden">
                <div data-gallery-inner className="absolute inset-0">
                  <Image
                    src={plate}
                    alt={withName(t.galleryAlt, character.name)}
                    fill
                    sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
                    className={galleryClass(plate)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-28 pb-28 lg:pt-58 lg:pb-54">

          <h2
            data-rise
            className="font-display text-roster-heading text-story-title leading-none font-semibold tracking-[-0.056em] uppercase"
          >
            {t.otherHeading}
          </h2>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:mt-21">
            {row.map((other) => {
              const entry = rosterEntry(other, locale);
              return (
                <li key={other.slug} data-rise className="w-full max-w-102.5">
                  <Link href={entry.href} className="focus-visible:outline-signal block focus-visible:outline-2 focus-visible:outline-offset-4">
                    <CharacterCard
                      variant="roster"
                      name={entry.name}
                      role={entry.role}
                      image={entry.image}
                      imageAlt={entry.alt}
                      portraitClass={entry.portraitClass}
                      figureClass={entry.figureClass}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
       </div>
      </div>
    </section>
  );
}

/** Heading left, content right — the frame's layout for three of five blocks. */
function Block({
  heading,
  children,
  className,
}: {
  heading: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (

    // THE SPLIT STARTS AT `lg`, AND THE LEFT TRACK IS A PROPORTION. A literal
    // 27.125rem behind `md` left 334px of a 768 screen for the copy once the
    // container padding was taken, so the lore ran hundreds of lines down a
    // gutter and the page came out 11084 tall against 1024s 6198. 40.94% is the
    // frame own 434 over its 1060 content box.
    <div className={`grid grid-cols-1 gap-10 lg:grid-cols-[40.94%_minmax(0,1fr)] lg:gap-0 ${className ?? ""}`}>
      <Heading>{heading}</Heading>
      <div>{children}</div>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    // Cap 30 in the frame, which is --text-h2's cap at 48px.
    <h2
      data-heading
      className="font-display text-menu-fg text-h2 max-w-68 leading-[1.05] font-semibold tracking-[-0.045em] uppercase"
    >
      {children}
    </h2>
  );
}

const bodyScene: SceneBuilder = (gsap, q, section) => {
  const media = gsap.matchMedia();

  media.add(
    { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
    (context) => {
      const { reduced } = context.conditions as { reduced: boolean };

      if (reduced) {
        gsap.set([q("[data-rise]"), q("[data-heading]"), q("[data-gallery-inner]")], { clearProps: "all" });
        return;
      }

      // 1. Heading drift.
      for (const heading of q("[data-heading]")) {
        gsap.fromTo(
          heading,
          { y: 40 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: heading.parentElement ?? heading,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      }


      const blocks = new Set(q("[data-rise]").map((el) => el.closest("div, ul")).filter(Boolean));
      for (const block of blocks) {
        const items = Array.from(block!.querySelectorAll<HTMLElement>("[data-rise]"));
        if (!items.length) continue;
        gsap.from(items, {
          y: 44,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,

          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: block as Element, start: "top 82%", once: true },
        });
      }


      for (const plate of q("[data-gallery]")) {
        const inner = plate.querySelector("[data-gallery-inner]");
        if (!inner) continue;
        gsap.fromTo(
          inner,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: plate, start: "top bottom", end: "bottom top", scrub: 0.8 },
          },
        );
      }

      void section;
    },
  );
};
