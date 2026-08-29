"use client";

import { useId } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The torn cream plate, at whatever size its box happens to be.
 *
 * Same artwork as `ornaments/onu-uzo-chip.svg` — a rect torn by an feTurbulence
 * + feDisplacementMap pair, the same technique as the page wipe — but drawn
 * inline so it can stretch.
 *
 * WHY NOT THE ASSET. The delivered SVG is a fixed 96x30 and carries no
 * `preserveAspectRatio="none"`, so as a CSS background it letterboxes rather
 * than stretching: a wider box leaves the plate at its own aspect ratio, floating
 * in the middle. The Ọnụ Ụzọ chip does not care, because every gate label is the
 * same length and the box is exactly 96x30 — that case is what `Chip` still
 * uses, and it is signed off. This is the case `Chip` flagged and deferred: a
 * label of any other length needs a plate that scales. Nothing was changed about
 * the delivered file.
 *
 * The colour is `currentColor`, so it comes from a `text-*` token on the caller
 * rather than a hex here. `--color-gild` IS this artwork's fill.
 *
 * The filter id is per-instance. SVG filter ids are document-global, so two
 * plates sharing one id would have the second silently re-use the first's
 * filter region — fine at identical sizes, wrong at different ones.
 */
export function TornPlate({ className }: { className?: string }) {
  const filterId = `torn-plate${useId()}`;

  return (
    <svg
      aria-hidden
      // The tear survives the stretch; without this the rect letterboxes.
      preserveAspectRatio="none"
      viewBox="0 0 96 30"
      className={cn("absolute inset-0 -z-10 h-full w-full", className)}
    >
      <defs>
        {/* Bleed matches the delivered asset's filter region, in user units, so
            the torn edge is not clipped where it strays outside the rect. */}
        <filter id={filterId} x="-4" y="-4" width="104" height="38" filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency="0.25 0.25" numOctaves="3" seed="7868" />
          <feDisplacementMap
            in="SourceGraphic"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <rect width="96" height="30" fill="currentColor" filter={`url(#${filterId})`} />
    </svg>
  );
}
