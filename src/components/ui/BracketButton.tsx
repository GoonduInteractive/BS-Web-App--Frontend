import Image from "next/image";
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
export function BracketButton({
  children,
  hoverLabel,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  /** Optional second label revealed on hover or keyboard focus. */
  hoverLabel?: string;
}) {
  return (
    <span className="group inline-flex items-center gap-4">
      <Bracket />
      <button
        type="button"
        className={cn(
          "text-menu-fg bg-signal font-body font-semibold text-h7 leading-none tracking-wide",
          "relative isolate overflow-hidden px-5 py-5",
          "transition-transform duration-300 ease-out group-hover:scale-105 group-has-focus-visible:scale-105",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal",
          "disabled:bg-disabled disabled:text-disabled-fg disabled:hover:scale-100 cursor-pointer",
          className,
        )}
        {...props}
      >
        {/* Sliding hover fill. Sits behind the label via -z-10 on an isolated
            stacking context, so it can never cover the text. */}
        <span
          aria-hidden
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
      </button>
      <Bracket mirrored />
    </span>
  );
}


function Bracket({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <Image
      src="/assets/ornaments/button-bracket.svg"
      alt=""
      aria-hidden
      width={12}
      height={36}
      className={cn(
        "h-9 w-3 select-none transition-transform duration-300 ease-out",
        mirrored
          ? "-scale-x-100 group-hover:-translate-x-2.5 group-has-focus-visible:-translate-x-2.5"
          : "group-hover:translate-x-2.5 group-has-focus-visible:translate-x-2.5",
      )}
    />
  );
}
