import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The red CTA flanked by bracket ornaments. It appears on every screen in the
 * prototype, so it is built once here (overview section 9).
 *
 * How the hover works, since three things move at once:
 *
 * 1. THE FILL slides in from the left and, on exit, slides back out the way it
 *    came. That is a CSS transition rather than a keyframe animation precisely
 *    so the exit reverses the entrance for free.
 *
 *    The artwork carries preserveAspectRatio="none" so it stretches to the
 *    button box. Without it an SVG background letterboxes inside background-size
 *    rather than stretching, and a 3.4:1 shape in a 2.4:1 button left bare red
 *    bands top and bottom that no amount of overscan could close.
 *
 *    Oversized to 136% x 112% and centred. The shape tapers off over about 18px
 *    at its left end, so at 100% width that taper sat inside the button and left
 *    a bright wedge. The overscan pushes every ragged edge outside the box, where
 *    overflow-hidden clips it, and the wash reads as filling the button.
 *
 *    Height is 112% and centred so the last of the ragged top and bottom feather
 *    is clipped by overflow-hidden and the wash reads as filling the button edge
 *    to edge, which is what the design asks for.
 *
 *    The artwork is a torn black shape. It is laid over the signal red at half
 *    opacity rather than being tinted, because black at 50% over signal FB0B01 lands
 *    on 7D0500 — within a hair of --color-ember 800C00, the specified hover
 *    fill. So the slide IS the hover colour, and a separate hover:bg-ember
 *    would double up and read too dark.
 *
 * 2. THE BUTTON scales up slightly. The brackets do not move, so the gap
 *    between them and the button closes and they appear to draw inwards.
 *    Scale is a compositor transform, so this costs no layout.
 *
 * 3. THE LABEL cross-fades and lifts. Both labels sit in one grid cell, so the
 *    button is as wide as the longer of the two and the swap never reflows.
 *
 * NOTE: overview section 8 gives Button as "Teko Heavy 14/22.7", but Figma and
 * the human both put the entry label in Host Grotesk. Following Figma. Raised.
 */
/**
 * The two delivered bracket artworks, and which side each one is drawn facing.
 *
 * Design shipped these as two files rather than one recolourable shape, so the
 * choice is a file swap. `field` names the SURFACE the button sits on, not the
 * bracket colour, because that is the thing a caller actually knows: on the dark
 * grounds the brackets are near-white, on the bone field they are the dark red
 * of --color-scar.
 *
 * THE TWO FILES FACE OPPOSITE WAYS. `button-bracket.svg` is drawn as the LEFT
 * bracket and `red-button-bracket.svg` as the RIGHT one — the paths are mirrors
 * of each other, not one path in two colours. So which side needs CSS mirroring
 * depends on which file is in use, which is why `drawn` is recorded here rather
 * than assumed.
 */
const BRACKET_ART = {
  dark: { src: "/assets/ornaments/button-bracket.svg", drawn: "left" },
  light: { src: "/assets/ornaments/red-button-bracket.svg", drawn: "right" },
} as const;

/** Bracket ornament dimensions, keyed by `size`. See the prop. */
const BRACKET_SIZE = {
  md: { width: 12, height: 36, box: "h-9 w-3", gap: "gap-4" },
  sm: { width: 10, height: 30, box: "h-7.5 w-2.5", gap: "gap-3.75" },
  xs: { width: 7, height: 21, box: "h-5.25 w-1.75", gap: "gap-2.5" },
} as const;

/**
 * The button's own fill, separate from the brackets beside it.
 *
 * `signal` is the Primary of overview section 8 and the default everywhere.
 * The Competition frame's featured card adds the other two: REGISTER NOW is the
 * same button on a black fill, and VIEW DETAILS is the sheet's Secondary — no
 * fill, a graphite border and label, blush on hover — drawn on the linen field,
 * which is the light ground the sheet assumed. The sliding wash is a black
 * shape at half opacity, so on `ink` it changes nothing and on `outline` it
 * would darken a hover the sheet says goes pale; `outline` hides it and
 * transitions its own fill instead.
 */
const TONE = {
  signal: "text-menu-fg bg-signal",
  ink: "text-menu-fg bg-ink",
  outline:
    "text-graphite border-graphite border-2 bg-transparent hover:bg-blush group-has-focus-visible:bg-blush",
  /**
   * No fill, no border, white label — the tournament page's VIEW FULL BRACKET,
   * brackets and all, drawn as text between the ornaments. There is no fill for
   * the wash to slide over, so hover fills the button with --color-crimson
   * instead, at the human's direction.
   */
  ghost:
    "text-menu-fg bg-transparent hover:bg-crimson group-has-focus-visible:bg-crimson",
} as const;

export function BracketButton({
  children,
  hoverLabel,
  field = "dark",
  tone = "signal",
  size = "md",
  href,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  /** Optional second label revealed on hover or keyboard focus. */
  hoverLabel?: string;
  /**
   * The ground the button sits on. Dark takes the near-white brackets, light
   * takes the red ones. Defaults to dark, which is most of this site.
   */
  field?: keyof typeof BRACKET_ART;
  /** The button's fill. See `TONE`. */
  tone?: keyof typeof TONE;
  /**
   * The ornaments' size. `md` is the 12 x 36 bracket with a 16 gap that every
   * CTA on the site draws; `sm` is the 10 x 30 with a 15 gap the Competition
   * frame puts beside the 14px labels on its tournament cards; `xs` is the
   * 7 x 21 with a 10 gap the Community phone frame puts beside COPY LINK. The
   * button's own size is the caller's, through `className`, as it always was.
   */
  size?: keyof typeof BRACKET_SIZE;
  /**
   * Render as a link rather than a button.
   *
   * A CTA that navigates should BE a link: it belongs in the tab order as one,
   * it opens in a new tab on the modifier click people expect, and assistive
   * tech announces where it goes. The empty cart's START SHOPPING is the first
   * of these on the site — every earlier CTA had no destination at all — so a
   * button with a router push would have been a link wearing the wrong hat.
   *
   * Styling is identical either way; only the element changes.
   */
  href?: string;
}) {
  const shared = cn(
    TONE[tone],
    // `text-[1.125rem]` IS text-h7. twMerge classifies our `--text-*` tokens as
    // colours, so `text-h7` beside the tone's text colour left one of them on
    // the floor — the colour, as it happened, and every label read white only
    // because the body's colour is white. The outline tone's graphite label
    // made that visible. Same trap SectionTitle documents, same fix.
    "font-body font-semibold text-[1.125rem] leading-none tracking-wide",
    "relative isolate overflow-hidden px-5 py-5",
    // The transform set `transition-transform` names, plus background-color, so
    // the outline and ghost tones' hover fills fade with the scale instead of
    // snapping. Written out because twMerge keeps one transition-* per element
    // and this one, being last, is the one it keeps.
    "transition-[transform,translate,scale,rotate,background-color] duration-300 ease-out group-hover:scale-105 group-has-focus-visible:scale-105",
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal",
    "disabled:bg-disabled disabled:text-disabled-fg disabled:hover:scale-100 cursor-pointer",
    href ? "inline-flex items-center justify-center" : "",
    className,
  );

  const body = (
    <Body hoverLabel={hoverLabel} wash={tone === "signal" || tone === "ink"}>
      {children}
    </Body>
  );

  return (
    <span className={cn("group inline-flex items-center", BRACKET_SIZE[size].gap)}>
      <Bracket field={field} size={size} />
      {href ? (
        <Link href={href} className={shared}>
          {body}
        </Link>
      ) : (
        <button type="button" className={shared} {...props}>
          {body}
        </button>
      )}
      <Bracket field={field} side="right" size={size} />
    </span>
  );
}

/** The label and its sliding hover wash, shared by both elements. */
function Body({
  children,
  hoverLabel,
  wash,
}: {
  children: React.ReactNode;
  hoverLabel?: string;
  /** Draw the sliding hover wash. Off for the outline tone, see TONE. */
  wash: boolean;
}) {
  return (
    <>
      {/* Sliding hover fill. Sits behind the label via -z-10 on an isolated
            stacking context, so it can never cover the text. */}
      <span
        aria-hidden
        hidden={!wash}
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 -translate-x-full opacity-50",
          "bg-[url('/assets/ornaments/button-hover.svg')] bg-size-[156%_132%] bg-center bg-no-repeat",
          "transition-transform duration-500 ease-out",
          "group-hover:translate-x-0 group-has-focus-visible:translate-x-0",
          "group-disabled:hidden",
        )}
      />

      {hoverLabel ? (
        <span className="grid">
          <span className="col-start-1 row-start-1 transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:opacity-0 group-has-focus-visible:-translate-y-2 group-has-focus-visible:opacity-0">
            {children}
          </span>
          {/* Hidden from assistive tech so the accessible name stays stable:
                the default label is the button's name, hover is presentation. */}
          <span
            aria-hidden
            className="col-start-1 row-start-1 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-has-focus-visible:translate-y-0 group-has-focus-visible:opacity-100"
          >
            {hoverLabel}
          </span>
        </span>
      ) : (
        children
      )}
    </>
  );
}

function Bracket({
  field,
  side = "left",
  size,
}: {
  field: keyof typeof BRACKET_ART;
  side?: "left" | "right";
  size: keyof typeof BRACKET_SIZE;
}) {
  const art = BRACKET_ART[field];
  const dims = BRACKET_SIZE[size];
  // Mirror only when the artwork is drawn facing the other way. Deriving this
  // from the ART rather than from the side is what lets the two files disagree
  // about which bracket they are, which they do.
  const mirrored = art.drawn !== side;

  return (
    <Image
      src={art.src}
      alt=""
      aria-hidden
      width={dims.width}
      height={dims.height}
      className={cn(
        dims.box,
        "select-none transition-transform duration-300 ease-out",
        mirrored && "-scale-x-100",
        // The spread always goes OUTWARD from the button, whichever way the
        // artwork faces, so it keys off the side and not off the mirroring.
        side === "right"
          ? "group-hover:-translate-x-2.5 group-has-focus-visible:-translate-x-2.5"
          : "group-hover:translate-x-2.5 group-has-focus-visible:translate-x-2.5",
      )}
    />
  );
}
