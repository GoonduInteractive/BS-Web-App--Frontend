import Image from "next/image";

import { TornDivider } from "@/components/ui/TornDivider";

/**
 * A Souls of the Arena card: portrait on the scar field, corner marks, and a
 * name plate separated from the image by a torn edge.
 *
 * TWO REDS, AND THEY ARE NOT INTERCHANGEABLE. Sampling the frame's card down a
 * column that misses the portrait gives #330500 from the card's top edge to the
 * seam, then #680500 from the seam to the bottom. So the portrait sits on the
 * DARKER --color-scar and the name plate is the LIGHTER --color-clot. This used
 * to paint the whole card oxblood with a clot plate, which had the two fields
 * far closer together than the frame does.
 *
 * The corner marks are clot on scar - the plate's colour, reused - and not the
 * bright --color-signal they were built with. Measured at 46 x 40 with a 2px
 * stroke, inset 15px, where they had been 28 x 28 at 1px inset 16.
 *
 * The torn seam is the same TornDivider used at section boundaries, pulled up
 * over the image so the plate appears to tear its way across. One
 * implementation, three cards, any colour.
 *
 * The portrait is SQUARE, not the 41:50 it was. The frame's card is 411 wide
 * with the seam 387 down and the plate 127 below it, so a square portrait plus
 * a 105px plate lands the frame's 514. The old ratio ran the portrait 114px long
 * and pushed the whole section 120px past the frame's height.
 *
 * FLAGGED: --color-clot (#680500) is still a sampled value, not confirmed from
 * Figma. --color-scar (#330500) is read from a delivered asset and is solid.
 * The Characters page's frame reads #6b0400 for the same plate - 3/255 off, so
 * it corroborates the token rather than contradicting it, but it is a second
 * unconfirmed reading of a value Design has never signed off.
 *
 * ---------------------------------------------------------------------------
 * TWO VARIANTS, BECAUSE TWO FRAMES DISAGREE ABOUT THE TRIM
 *
 * The geometry is common ground and that is why this is one component rather
 * than two: both frames draw a 410 x 513 card, the seam 383 down, the portrait
 * on scar, the plate on clot, the name inset 37 at a 30px cap. Only the trim
 * differs, in two ways, and both differences are measured:
 *
 *   `souls`  (default) - The Game page. A SINGLE corner bracket, 46 x 40 at a
 *            15px inset, and a plate that bottom-pads its content.
 *
 *   `roster` - The Characters page. A DOUBLE bracket: two 40 x 35 brackets
 *            offset 6px diagonally, at insets 15/23 and 21/17. Its plate
 *            CENTRES its content, which is what lets a card carry no role at
 *            all - Oji Isi has none, and its name sits 18px lower than its
 *            neighbours' precisely because the plate centres one line instead
 *            of two.
 *
 * FLAGGED: the two may well be the same card and the Game page's single bracket
 * may simply be a miss. That frame was signed off, so this does not quietly
 * change it - the variant keeps them apart until Design says they are one.
 */
export function CharacterCard({
  name,
  role,
  image,
  imageAlt,
  priority = false,
  variant = "souls",
  portraitClass,
  figureClass,
  onSelect,
}: {
  name: string;
  /** Optional: the roster's Oji Isi card carries a name and nothing else. */
  role?: string;
  image: string;
  imageAlt: string;
  priority?: boolean;
  variant?: "souls" | "roster";
  /**
   * Framing override for the portrait, as literal Tailwind classes.
   *
   * WHY THIS EXISTS AT ALL. Scored against the frame, plain `object-cover`
   * reproduces all six legends cards almost exactly - a mean absolute error of
   * 2.2 to 5.7. It does NOT reproduce Soma, Kaira or Ogbun'abali, which come out
   * at 13.9 to 44.9 however they are fitted, because those three are hand-placed
   * in Figma at their own scale and offset. Solving each gives a zoom of 1.19,
   * 0.78 and 1.27 respectively, none of which any single object-fit rule yields.
   *
   * Passed as complete class strings rather than numbers because Tailwind scans
   * source text for whole class names - a computed `w-[${n}%]` never reaches the
   * generated CSS.
   */
  portraitClass?: string;
  /**
   * Extra classes for the fill-fitted portrait. Omalicha's mask - her render
   * has no alpha channel, so its black ground is faded into the scar field
   * rather than sitting on it as a rectangle. See the manifest.
   */
  figureClass?: string;
  /** Opens the character's modal. Omit and the card is not interactive. */
  onSelect?: () => void;
}) {
  const roster = variant === "roster";

  return (
    <article className="bg-scar group relative flex flex-col overflow-hidden">
      {/* THE WHOLE CARD IS THE CONTROL, but the clickable thing is a real button
          rather than a handler on the article: a card that opens a dialog has to
          be reachable and operable from the keyboard, and stretching one button
          across the card gets that without nesting anything interactive inside
          it. The card carries no other control, so nothing is trapped under it.

          It is labelled by the name and role that are already on the plate, so
          the accessible name is the card's own text rather than a duplicate. */}
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-label={role ? `${name}, ${role}` : name}
          className="focus-visible:outline-signal absolute inset-0 z-20 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2"
        />
      ) : null}

      <div className="relative aspect-square w-full overflow-hidden">
        {/*
          THE PORTRAIT ZOOMS ON HOVER, and the clip that makes that work is the
          wrapper's `overflow-hidden`, not the card's - the card also clips, but
          the corner marks sit outside this box and must not scale with the art.

          `scale-115` compiles to the `scale` property in v4, so it is safe from
          any GSAP scene that tweens an ancestor's `transform`. It must stay off
          any element a timeline touches directly: GSAP normalises `scale` onto
          its own transform and writes `scale: none` inline, which would kill
          this silently. SoulsSection tweens a wrapper around the card for
          exactly that reason.
        */}
        {portraitClass ? (
          // Hand-placed: sized and offset in percentages of the card, so the
          // framing holds at every breakpoint rather than only at 410.
          <Image
            src={image}
            alt={imageAlt}
            width={1230}
            height={1539}
            priority={priority}
            sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 30vw"
            className={`absolute h-auto max-w-none transition-transform duration-700 ease-out group-hover:scale-115 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${portraitClass}`}
          />
        ) : (
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 30vw"
            className={`object-cover object-top transition-transform duration-700 ease-out group-hover:scale-115 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${figureClass ?? ""}`}
          />
        )}

        {/* Corner marks. Decorative, drawn rather than shipped as four files.
            Above the portrait so the zoom passes behind them. */}
        {roster ? <DoubleMarks /> : <SingleMarks />}
      </div>

      {/* Pulled up so the plate tears into the portrait rather than butting it.
          The pull matches the divider's own height, which grew from 24/40 to a
          flat 56 when it moved onto TornSurface's 47.4 depth - leaving the old
          -mt-6 would have added 32px of plate below the seam. */}
      <TornDivider
        edge="top"
        seed={7311}
        className="text-clot relative z-10 -mt-14"
      />

      {/* The frame insets the name 37px from the card edge, not the 24 this had.

          THE ROSTER PLATE IS PULLED UP TO THE SEAM, and that is what makes
          centring land. The divider's box nets to zero height, so an un-pulled
          plate starts at the portrait's bottom edge (410) and centres its
          content at 461 - but the frame centres on the VISIBLE plate, which
          starts at the seam (383) and centres at 448. `-mt-[27px]` moves the box
          to where the eye reads it, and the card still totals the frame's 513:
          410 portrait + 130 plate - 27 pull. */}
      <div
        className={
          roster
            ? "bg-clot relative z-10 -mt-[27px] flex h-[130px] flex-col justify-center px-9"
            : "bg-clot relative z-10 px-9 pb-6"
        }
      >
        {/* TRACKING IS PART OF THE VARIANT, and it is measured rather than
            styled. Against the Characters frame the souls value of -0.03em sets
            every name about 9% wide - 218 against 200 for NZE UGWUOKE, 179
            against 165 for LIEUTENANT, 161 against 148 for THE BEAST. Divided by
            each name's advance count those three agree on 1.63px per advance,
            which at 47px is 0.0347em, so -0.065em closes it.

            The same display-face gap recorded on --text-gate, turning up a
            fourth time. The souls value is left alone: it was signed off against
            its own frame, and the two should converge on Design's answer to
            risk 3 rather than on a change made quietly here. */}
        <h3
          className={
            roster
              ? "font-display text-menu-fg text-[2.9375rem] leading-none font-semibold tracking-[-0.065em] uppercase"
              : "font-display text-menu-fg text-[2.9375rem] leading-none font-semibold tracking-[-0.03em] uppercase"
          }
        >
          {name}
        </h3>
        {/* Omitted entirely rather than rendered empty, so the centred plate
            actually centres a single line. */}
        {role ? <p className="text-menu-fg/85 font-body text-body mt-2">{role}</p> : null}
      </div>
    </article>
  );
}

/** The Game page's mark: one 46 x 40 bracket per corner, inset 15. */
function SingleMarks() {
  return (
    <>
      <span
        aria-hidden
        className="border-clot absolute top-[15px] left-[15px] z-10 h-10 w-11 border-t-2 border-l-2"
      />
      <span
        aria-hidden
        className="border-clot absolute top-3.75 right-[15px] z-10 h-10 w-11 border-t-2 border-r-2"
      />
      <span
        aria-hidden
        className="border-clot absolute bottom-[15px] left-[15px] z-10 h-10 w-11 border-b-2 border-l-2"
      />
      <span
        aria-hidden
        className="border-clot absolute right-[15px] bottom-[15px] z-10 h-10 w-11 border-r-2 border-b-2"
      />
    </>
  );
}

/**
 * The Characters page's mark: TWO 40 x 35 brackets per corner, offset 6px
 * diagonally so they nest.
 *
 * Measured off the frame's top-left corner, card at (298, 1157): one bracket
 * turns at (319, 1174) and the other at (313, 1180) - insets of 21/17 and 15/23,
 * both with a 2px stroke, 40px along and 35px down.
 *
 * The offsets mirror per corner, which is why they are derived from the corner's
 * own axes below rather than written out sixteen times.
 */
const CORNERS = [
  { side: "top-left", box: "border-t-2 border-l-2", near: "top-[17px] left-[21px]", far: "top-[23px] left-[15px]" },
  { side: "top-right", box: "border-t-2 border-r-2", near: "top-[17px] right-[21px]", far: "top-[23px] right-[15px]" },
  { side: "bottom-left", box: "border-b-2 border-l-2", near: "bottom-[17px] left-[21px]", far: "bottom-[23px] left-[15px]" },
  { side: "bottom-right", box: "border-b-2 border-r-2", near: "bottom-[17px] right-[21px]", far: "bottom-[23px] right-[15px]" },
] as const;

function DoubleMarks() {
  return (
    <>
      {CORNERS.map((c) => (
        <span key={c.side} aria-hidden>
          <span className={`border-clot absolute z-10 h-[35px] w-10 ${c.box} ${c.near}`} />
          <span className={`border-clot absolute z-10 h-[35px] w-10 ${c.box} ${c.far}`} />
        </span>
      ))}
    </>
  );
}
