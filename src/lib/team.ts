/**
 * What the team grid knows that the CMS does not: how each delivered portrait
 * is cropped into its card, and how a short last row is centred.
 *
 * WHO IS ON THE TEAM LIVES IN THE CMS since 2026-09-22 - `src/content/team/`,
 * read by `src/lib/api/team.ts`. Before that this file held the manifest and
 * the copy sat in `src/messages`; the five people were moved into the
 * collection as they were, stand-in portraits and all.
 *
 * FRAMING IS KEYED BY THE PICTURE FILE, not by the person. A framing constant
 * is only ever valid for the file it was measured on (see Kaira's note in
 * `characters.ts`), so it follows the file: whoever the editor attaches
 * `MICHEAL.jpeg` to gets Michael's crop, and a file nobody has measured gets a
 * plain top-anchored cover, which is right for most head-and-shoulders shots.
 */

/**
 * Framing for the 300 x 350 card, as literal Tailwind classes on an absolutely
 * positioned image.
 *
 * WHY THE DELIVERED FILES CARRY ONE. Both studio shots are on their own canvas
 * at their own scale, and `object-cover` reproduces neither. Each value below
 * is solved rather than chosen: the frame's card was template-matched against
 * its source image by normalised cross-correlation over scale and offset, and
 * the winning transform written out as percentages of the card.
 *
 *   leslie  NCC 0.987  scale 0.31 of 1598² → 495² in a 300 x 350 box,
 *                      window origin (96, 12)   → 165%, -32%, -3.4%
 *
 * Leslie needs the larger correction for the same reason `soma-nysc.png` does
 * in `characters.ts`: the figure fills 1213 of a 1598 canvas with empty white
 * above it, so cover renders a small head in a large frame.
 *
 * THE 2026-09-19 PORTRAITS HAVE NO FRAME TO SOLVE AGAINST, so their framing is
 * read off the file and chosen by eye - a head-and-shoulders crop like the
 * frame's cards:
 *
 *   SOPHIA-2.jpeg   507 x 900, seated full-length, face 30..45% down at 55%
 *                   across → 120% wide, -10%, -26%: the card shows 14%..68% of
 *                   her height, the face in its upper half
 *   MICHEAL.jpeg    5472 x 3648 landscape, standing at 52% across, head
 *                   17..40% down → 175% wide (covers the 6:7 by height), -41%,
 *                   0: centred on him, arms crossed at the foot
 *   Ogbuagu.png     1230 x 1342 cutout → 107% wide (covers the 6:7 by height),
 *                   -3.5%, 0 - the stand-in for anyone without a portrait yet
 *
 * Percentages, not pixels, so the framing survives every breakpoint - the card
 * holds a 6:7 aspect at all of them.
 */
const SOLVED = "h-auto max-w-none";

export const PORTRAIT_FRAMING: Readonly<Record<string, string>> = {
  "/assets/about/leslie.png": `${SOLVED} left-[-32%] top-[-3.4%] w-[165%]`,
  "/assets/about/SOPHIA-2.jpeg": `${SOLVED} left-[-10%] top-[-26%] w-[120%]`,
  "/assets/about/MICHEAL.jpeg": `${SOLVED} left-[-41%] top-0 w-[175%]`,
  "/assets/characters/Ogbuagu.png": `${SOLVED} left-[-3.5%] top-0 w-[107%]`,
};

/** A file nobody has measured: fill the card, keep the head. */
export const DEFAULT_FRAMING = "inset-0 h-full w-full object-cover object-top";

export function portraitFraming(image: string): string {
  return PORTRAIT_FRAMING[image] ?? DEFAULT_FRAMING;
}

/**
 * One card's width, as the row it sits in would have given it: the whole row
 * on a phone, half from `sm`, a third from `lg`. The 1.25rem in each
 * expression is the row's own `gap-x-5`, so three cards and two gaps fill the
 * row exactly.
 *
 * THREE ACROSS AT THE WIDEST, per the human (2026-09-22) - it was four, and
 * the step 1 / 2 / 3 / 4 is now 1 / 2 / 3. Four across a 1024 viewport put the
 * card at 196px, two thirds of the frame's 300, and a portrait that small stops
 * being a portrait; three holds the card nearer the frame's size.
 *
 * The row centres what is left over (see TeamSection), so nothing here has to
 * know how many people there are.
 */
export const TEAM_CARD = "w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]";

