import type { Messages } from "@/lib/utils/messages";

/**
 * The team manifest — who appears on the About page's grid, in what order, and
 * which portrait each card carries.
 *
 * COPY LIVES IN `src/messages`, NOT HERE, exactly as it does in `characters.ts`.
 * This file holds ids, asset paths and framing: the things that are the same in
 * English and Igbo. `memberKey` is the join between the two.
 *
 * FIVE PEOPLE, PER THE HUMAN (2026-09-19), in the order given: Moses Onwe (COO),
 * Michael Apeli (Lead Technical Environment Artist), Goodness Ndukwe (CTO & Lead
 * Game Developer), Leslie Osinachi-Okok (CEO & Lead Game Designer), Sophia
 * Ahuoyiza (Product Engineering Lead). The frame drew six cards from two
 * portraits with "FIRSTNAME SURNAME" placeholders; the names and roles are real
 * now. Three portraits are real (Leslie's, Sophia's new one, Michael's); Moses
 * and Goodness have none yet and carry the Ogbuagu render as a stand-in — the
 * human's choice ("the other people who don't have their images use this") —
 * FLAGGED as a stand-in, with the alt text saying so.
 *
 * Adding or replacing a person: an entry here with a `memberKey`, that key under
 * `about.team.members` in both message files, and a framing class solved for
 * the file (see below). Nothing in the components knows how many there are.
 */

export type TeamMember = {
  /** Stable React key. Unique even where two entries share a person. */
  id: string;
  /** Key into `messages.about.team.members`. */
  memberKey: keyof Messages["about"]["team"]["members"];
  image: string;
  /**
   * Framing for the 300 x 350 card, as literal Tailwind classes.
   *
   * WHY EVERY CARD CARRIES ONE. Both portraits are studio shots on their own
   * canvas at their own scale, and `object-cover` reproduces neither. Each value
   * below is solved rather than chosen: the frame's card was template-matched
   * against its source image by normalised cross-correlation over scale and
   * offset, and the winning transform written out as percentages of the card.
   *
   *   leslie  NCC 0.987  scale 0.31 of 1598² → 495² in a 300 x 350 box,
   *                      window origin (96, 12)   → 165%, -32%, -3.4%
   *   sophia  (the old sophia.png) NCC 0.995 → 111%, -5.3%, 0 — retired
   *
   * Leslie needs the larger correction for the same reason `soma-nysc.png` does
   * in `characters.ts`: the figure fills 1213 of a 1598 canvas with empty white
   * above it, so cover renders a small head in a large frame.
   *
   * THE 2026-09-19 PORTRAITS HAVE NO FRAME TO SOLVE AGAINST, so their framing is
   * read off the file and chosen by eye — a head-and-shoulders crop like the
   * frame's cards:
   *
   *   SOPHIA-2.jpeg   507 x 900, seated full-length, face 30..45% down at 55%
   *                   across → 120% wide, -10%, -26%: the card shows 14%..68% of
   *                   her height, the face in its upper half
   *   MICHEAL.jpeg    5472 x 3648 landscape, standing at 52% across, head
   *                   17..40% down → 175% wide (covers the 6:7 by height), -41%,
   *                   0: centred on him, arms crossed at the foot
   *   Ogbuagu.png     1230 x 1342 cutout → 107% wide (covers the 6:7 by height),
   *                   -3.5%, 0
   *
   * Percentages, not pixels, so the framing survives every breakpoint — the card
   * holds a 6:7 aspect at all of them.
   */
  portraitClass: string;
};

const LESLIE = "left-[-32%] top-[-3.4%] w-[165%]";
const SOPHIA = "left-[-10%] top-[-26%] w-[120%]";
const MICHAEL = "left-[-41%] top-0 w-[175%]";
const STAND_IN = "left-[-3.5%] top-0 w-[107%]";

/** Moses's and Goodness's, until their portraits arrive. See the note above. */
const STAND_IN_IMAGE = "/assets/characters/Ogbuagu.png";

export const TEAM: readonly TeamMember[] = [
  { id: "moses", memberKey: "moses", image: STAND_IN_IMAGE, portraitClass: STAND_IN },
  { id: "michael", memberKey: "michael", image: "/assets/about/MICHEAL.jpeg", portraitClass: MICHAEL },
  { id: "goodness", memberKey: "goodness", image: STAND_IN_IMAGE, portraitClass: STAND_IN },
  { id: "leslie", memberKey: "leslie", image: "/assets/about/leslie.png", portraitClass: LESLIE },
  { id: "sophia", memberKey: "sophia", image: "/assets/about/SOPHIA-2.jpeg", portraitClass: SOPHIA },
] as const;

/**
 * Cards per row on the widest breakpoint. The frame draws four.
 *
 * The grid steps 1 / 2 / 3 / 4 up to xl rather than jumping straight to four,
 * because four across a 1024 viewport puts the card at 196px — two thirds of the
 * frame's 300 — and a portrait that small stops being a portrait.
 */
export const TEAM_COLUMNS = 4;

/**
 * Which column the last row starts in, so a short final row sits CENTRED rather
 * than left-aligned.
 *
 * The frame's fifth and sixth cards are in columns 2 and 3, not 1 and 2, and
 * that is the only reason this exists. Six into four leaves two over, so the row
 * is inset by one column.
 *
 * SCOPED TO xl, WHICH IS THE ONLY BREAKPOINT THAT NEEDS IT. Below xl the grid
 * is one, two or three across, and six divides evenly into two and three — an
 * unscoped offset would push the last row sideways in layouts that have no short
 * row to centre.
 *
 * Returned as a whole class name because Tailwind scans source text: a computed
 * `xl:col-start-${n}` never reaches the generated CSS. Null when the last row is
 * full and nothing needs offsetting.
 *
 * ONE CARD LEFT OVER (five people, 2026-09-19) cannot be centred by a column
 * start in a four-column grid — column 2 sits left of the middle. It spans the
 * two middle columns instead and centres itself in them at one column's width:
 * the span is two tracks and the 1.25rem gap between them, so one track is
 * half of the span less the gap.
 */
export function lastRowOffsetClass(count: number): string | null {
  const remainder = count % TEAM_COLUMNS;
  if (remainder === 0) return null;
  if (remainder === 1) return "xl:col-start-2 xl:col-span-2 xl:mx-auto xl:w-[calc((100%-1.25rem)/2)]";
  const offset = Math.floor((TEAM_COLUMNS - remainder) / 2);
  return (
    {
      1: "xl:col-start-2",
      2: "xl:col-start-3",
      3: "xl:col-start-4",
    }[offset] ?? null
  );
}

/** The index the last row begins at, which is what the offset class attaches to. */
export function lastRowStart(count: number): number {
  const remainder = count % TEAM_COLUMNS;
  return remainder === 0 ? -1 : count - remainder;
}
