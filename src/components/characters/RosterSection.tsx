"use client";

import { useState } from "react";

import { CharacterCard } from "@/components/characters/CharacterCard";
import { CharacterModal, type RosterEntry } from "@/components/characters/CharacterModal";
import { Reveal } from "@/components/motion/Reveal";
import { CHARACTERS, castCopy, characterHref, type Character } from "@/lib/characters";
import { TornDivider } from "@/components/ui/TornDivider";
import type { Messages } from "@/lib/utils/messages";

/**
 * Section 2 of The Characters page — the roster. Figma:
 * `context/design/04-characters/The characters.png`, y 834..4150 at 1440.
 *
 * Three groups on one ground: CHAMPIONS (2 cards), GODS (1), and
 * LEGENDS & ADVERSARIES (6, in a 3 x 2 grid). Every card opens a modal.
 *
 * ONE CARD SIZE, THREE COUNTS. That is the finding that shapes the whole
 * section. Every card in all four rows measures 410 x 513 with a 24px gutter,
 * and each group is that row centred in the viewport:
 *
 *   champions  x  298..1141   2 x 410 + 24  = 844, centred
 *   gods       x  519..928    410,          centred (see the nudge below)
 *   legends    x   81..1358   3 x 410 + 48 = 1278, centred
 *
 * So this is NOT a 12-column grid that the groups sit inside — a fluid grid
 * would give the champions row 612px cards and the legends row 410px ones. It is
 * a fixed card width, centred, and the group's width follows from its count.
 *
 * THE VERTICAL RHYTHM IS THE SAME IN ALL THREE GROUPS, measured from the frame:
 *
 *   heading cap top -> cards top   123
 *   cards bottom -> next cap top   214
 *   row gutter (legends)            24, the same as the column gutter
 *
 * NO SECTION BACKGROUND HERE. The ground is a page-level gradient — see
 * `bg-roster` in globals.css for why the frame puts it there rather than on
 * this box.
 *
 * FLAGGED: the GODS group sits 3.5px right of centre — heading centred at 724
 * and card at 723.5 against the page's 720, while champions and legends are dead
 * centre. Same class of Figma nudge as the Game page's two-paths block, and left
 * uncorrected rather than reproduced, since one card is read as centred and a
 * 3.5px lean would only look like a mistake.
 *
 * FLAGGED: the OGBUAGU and MKPUME plates set their name and role at a 29px inset
 * where the other four legends cards use 35 to 37. Two cards out of six, so the
 * majority is built and those two are read as a slip.
 *
 * FLAGGED: no 380 frame for this page, so every breakpoint below `lg` is
 * derived rather than read.
 */

/**
 * ONE CARD WIDTH FOR ALL THREE GROUPS, AT EVERY BREAKPOINT, and it has to be a
 * variable rather than a per-grid track for a reason worth stating.
 *
 * Each group has a different column count, so sizing tracks independently makes
 * them disagree: at 1024 a fluid three-across legends row computes 309 while the
 * two-across champions row computes 476 and the lone gods card takes its 410.
 * Three card sizes on one page. That is the same fault the phone had, and the
 * human called it there.
 *
 * So the WIDTH is declared once, on the container, and every grid lays its
 * columns out at `var(--card)`. Because all three grids are the same width, a
 * `calc` against `100%` resolves identically in each of them. The narrowest row
 * — three across — is what sets it at each step, and the wider rows simply use
 * fewer tracks of the same size and centre what is left.
 *
 * THE FRAME'S 410 ONLY APPLIES ONCE IT FITS. Three 410s and two 24px gutters is
 * 1278, which needs 1326 with the section's own padding — past `lg` and past
 * `xl`. Pinned at `lg` it overflowed the viewport by 127px at 1024, which is
 * what `min-[1350px]` now prevents. Below that the tracks are fluid and the
 * cards stay square and equal.
 */
const CARD_WIDTH = [
  "[--card:100%]",
  "sm:[--card:calc((100%-1.5rem)/2)]",
  "lg:[--card:calc((100%-3rem)/3)]",
  "min-[1350px]:[--card:25.625rem]",
].join(" ");

const GRID = "grid grid-cols-1 justify-center gap-6";
const CARD = "w-full max-w-[25.625rem]";

/**
 * Portrait framing for the three hand-placed cards. See `portraitClass` on
 * CharacterCard for why these exist and how they were solved.
 *
 *   soma        w 488, dx -42, dy   0   against a 410 card  -> mae  3.3
 *   kaira       w 320, dx  30, dy  -2                       -> mae 10.2
 *   ogbunabali  w 522, dx -46, dy -26                       -> mae 16.0
 *
 * FLAGGED: Soma's fit is as good as the legends cards'. Kaira's and
 * Ogbun'abali's are not, at 10.2 and 16.0 against their 2.2 to 5.7, which most
 * likely means the frame was drawn from a different export of those two renders
 * than the files delivered. They are far closer than any object-fit rule gets,
 * and worth confirming against Figma.
 */

export function RosterSection({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.characters.roster;
  const [open, setOpen] = useState<RosterEntry | null>(null);

  // THE MANIFEST IS THE SOURCE OF THE ARTWORK AND THE SLUGS, and it moved there
  // when the detail route landed: the roster grid, the modal's SEE FULL DETAILS
  // and the detail page's OTHER CHAMPIONS row all need the same nine records,
  // and three copies of that list would have drifted the first time an asset
  // changed. Copy still comes from `messages`; `castKey` joins the two.
  const entries = {} as Record<Character["castKey"], RosterEntry>;
  for (const character of CHARACTERS) {
    entries[character.castKey] = {
      ...castCopy(messages, character.castKey),
      image: character.image,
      portraitClass: character.portraitClass,
      href: characterHref(locale, character.slug),
    };
  }

  return (
    <section className="relative">
      {/* THE SECTION OWNS ITS TOP EDGE. The frame tears the roster's ground up
          into the hero plate: measured column by column the boundary runs
          between y800 and y843, against the hero's flat bottom at 834. The same
          TornDivider every section boundary on this site uses, in the gradient's
          own top stop, so the teeth read as this field biting upward rather than
          as a separate band.

          Hung ABOVE the section box, so the section must not clip. */}
      <TornDivider
        edge="top"
        seed={4821}
        className="text-roster-top absolute inset-x-0 -top-6 z-10"
      />

      {/* `--card` is declared here, once, and read by all three grids below.
          `px-6` throughout: at 1440 that leaves 1392, which centres the frame's
          1278 legends row to margins of exactly 81. */}
      <div
        className={`relative mx-auto w-full max-w-[90rem] px-6 pb-40 md:pb-[13.375rem] ${CARD_WIDTH}`}
      >
        <Group heading={t.champions.heading} first>
          <div className={`${GRID} sm:grid-cols-[repeat(2,var(--card))]`}>
            <Card entry={entries.soma} onSelect={setOpen} />
            <Card entry={entries.kaira} onSelect={setOpen} />
          </div>
        </Group>

        <Group heading={t.gods.heading}>
          <div className={`${GRID} sm:grid-cols-[var(--card)]`}>
            <Card entry={entries.ogbunabali} onSelect={setOpen} />
          </div>
        </Group>

        <Group heading={t.legends.heading}>
          <div className={`${GRID} sm:grid-cols-[repeat(2,var(--card))] lg:grid-cols-[repeat(3,var(--card))]`}>
            <Card entry={entries.nzeUgwuoke} onSelect={setOpen} />
            <Card entry={entries.lieutenant} onSelect={setOpen} />
            <Card entry={entries.theBeast} onSelect={setOpen} />
            <Card entry={entries.ojiIsi} onSelect={setOpen} />
            <Card entry={entries.ogbuagu} onSelect={setOpen} />
            <Card entry={entries.mkpume} onSelect={setOpen} />
          </div>
        </Group>
      </div>

      {open ? (
        <CharacterModal
          entry={open}
          cta={t.modal.cta}
          closeLabel={t.modal.close}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </section>
  );
}

/**
 * A heading and its row of cards.
 *
 * The 214px gap between a group's cards and the next heading is carried as the
 * NEXT group's top padding rather than the previous one's bottom, so the last
 * group does not have to cancel a margin it never wanted. `first` takes the
 * section's own opening gap instead.
 */
function Group({
  heading,
  children,
  first = false,
}: {
  heading: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div className={first ? "pt-24 md:pt-[12rem]" : "pt-24 md:pt-[12.625rem]"}>
      <Reveal
        as="h2"
        // SIZE IS --text-story-title, REUSED. The frame's cap is 50, which is
        // that token's cap at 1440 — the same size as The Story's heading. A
        // third display token for an identical measurement would say nothing.
        //
        // -0.056em is StorySection's value, carried over: same face, same size,
        // same compensation for Teko setting wider than the frame's face.
        //
        // THE INK IS A GRADIENT, not a colour, which is why it comes through a
        // utility that paints through the glyphs rather than a `text-*` token.
        // It spans the heading's own block rather than shrink-wrapping the
        // words: across GODS the frame ramps 14 levels and across LEGENDS 46,
        // which is close to what a container-wide ramp predicts (8 and 39) and
        // nothing like a per-word one, which would show the full 95 on both.
        className="font-display text-roster-heading text-story-title text-center leading-none font-semibold tracking-[-0.056em] uppercase"
      >
        {heading}
      </Reveal>
      {/* 56, not the 123 the frame measures between the heading cap top and the
          cards: the gap starts at the heading BOX top, and Teko sets its cap 8px
          down from there with a further 59 of line box below the baseline. */}
      <Reveal delay={80} className="mt-12 md:mt-14">
        {children}
      </Reveal>
    </div>
  );
}

function Card({ entry, onSelect }: { entry: RosterEntry; onSelect: (entry: RosterEntry) => void }) {
  return (
    <div className={CARD}>
      <CharacterCard
        variant="roster"
        name={entry.name}
        role={entry.role}
        image={entry.image}
        imageAlt={entry.alt}
        portraitClass={entry.portraitClass}
        onSelect={() => onSelect(entry)}
      />
    </div>
  );
}
