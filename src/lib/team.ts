import type { Messages } from "@/lib/utils/messages";

/**
 * The team manifest — who appears on the About page's grid, in what order, and
 * which portrait each card carries.
 *
 * COPY LIVES IN `src/messages`, NOT HERE, exactly as it does in `characters.ts`.
 * This file holds ids, asset paths and framing: the things that are the same in
 * English and Igbo. `memberKey` is the join between the two.
 *
 * SIX CARDS, TWO PEOPLE, AND THAT IS WHAT THE FRAME DRAWS. The Figma grid
 * repeats `leslie` and `sophia` alternately and labels four of the six
 * "FIRSTNAME SURNAME / Position at GOONDU" — a designed placeholder, not an
 * oversight of ours, and the human confirmed it ships that way for now. Only two
 * portraits were delivered.
 *
 * When the real team arrives this list is the only thing that changes: add an
 * entry per person, give each a `memberKey`, and add that key under
 * `about.team.members` in both message files. Nothing in the components knows
 * how many there are.
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
   *   sophia  NCC 0.995  scale 0.21 of 1584x1734 → 333 x 364,
   *                      window origin (16, 0)    → 111%, -5.3%, 0
   *
   * Leslie needs the larger correction for the same reason `soma-nysc.png` does
   * in `characters.ts`: the figure fills 1213 of a 1598 canvas with empty white
   * above it, so cover renders a small head in a large frame.
   *
   * Percentages, not pixels, so the framing survives every breakpoint — the card
   * holds a 6:7 aspect at all of them.
   */
  portraitClass: string;
};

const LESLIE = "left-[-32%] top-[-3.4%] w-[165%]";
const SOPHIA = "left-[-5.3%] top-0 w-[111%]";

export const TEAM: readonly TeamMember[] = [
  { id: "member-1", memberKey: "leslie", image: "/assets/about/leslie.png", portraitClass: LESLIE },
  { id: "member-2", memberKey: "sophia", image: "/assets/about/sophia.png", portraitClass: SOPHIA },
  { id: "member-3", memberKey: "leslie", image: "/assets/about/leslie.png", portraitClass: LESLIE },
  { id: "member-4", memberKey: "sophia", image: "/assets/about/sophia.png", portraitClass: SOPHIA },
  { id: "member-5", memberKey: "leslie", image: "/assets/about/leslie.png", portraitClass: LESLIE },
  { id: "member-6", memberKey: "sophia", image: "/assets/about/sophia.png", portraitClass: SOPHIA },
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
 */
export function lastRowOffsetClass(count: number): string | null {
  const remainder = count % TEAM_COLUMNS;
  if (remainder === 0) return null;
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
