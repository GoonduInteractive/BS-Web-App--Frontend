"use client";

import { useEffect, useRef, useState } from "react";

import TornSurface from "@/components/ui/TornSurface";
import { cn } from "@/lib/utils/cn";

/**
 * The ragged boundary between two sections — every one on the site goes through
 * here.
 *
 * This is now a thin wrapper around `TornSurface`, the designer's procedural
 * tear. It handles the two things TornSurface deliberately leaves to its caller:
 * measuring a fluid container so the viewBox stays 1:1 with painted pixels, and
 * clipping so only ONE of the four torn edges is ever in frame.
 *
 * WHY IT MEASURES INSTEAD OF STRETCHING
 *
 * `feDisplacementMap`'s scale and `feTurbulence`'s baseFrequency are both in
 * user-space units. Stretch the viewBox to a wider container and the teeth
 * stretch with it — they smear into soft vertical streaks and no two sections
 * look alike. Passing real pixels keeps the tear a constant PHYSICAL size, so it
 * reads identically at 380px and 2560px, which is the whole point of the
 * component. The previous implementation used `preserveAspectRatio="none"` over
 * a fixed 1440 viewBox and did stretch; it also ran at scale 26 where the
 * frames measure a ~30px tear, so the teeth were shallower than designed.
 *
 * HOW ONE EDGE IS ISOLATED
 *
 * TornSurface tears all four sides of its rect. The surface is drawn taller than
 * this strip by a full `depth` and anchored to whichever edge is wanted, so the
 * opposite tear falls outside the strip and `overflow-hidden` removes it. The
 * left and right tears are handled by drawing wider than the box, for the same
 * reason.
 *
 * The strip's own height is therefore a floor, not a free choice: it must clear
 * the tear's full excursion (`depth`, 47.4) or the teeth get flat-topped.
 *
 * `fill` is `currentColor`, so the colour comes from a `text-*` token on this
 * element. Bitmap edges were never an option: they band on wide screens
 * (overview section 9).
 */

/** The designer's tear depth. The strip has to be at least this tall. */
const DEPTH = 47.4;

/**
 * Strip height. `DEPTH` of tear plus a margin of solid colour below it, so the
 * fill meets the section cleanly even where the noise reaches its extreme.
 */
const HEIGHT = 56;

/**
 * Width used for the very first paint, before the observer has measured.
 *
 * Not a guess that has to be right: the surface is clipped, so a too-wide value
 * simply draws a tear that is cropped, and a too-narrow one leaves a sliver for
 * a single frame. 1440 is the design width and covers the common case exactly.
 */
const FALLBACK_WIDTH = 1440;

export function TornDivider({
  edge,
  seed,
  className,
}: {
  /**
   * Which way the teeth point. `top` tears the divider's upper edge, so it sits
   * at the START of a section; `bottom` tears the lower edge.
   */
  edge: "top" | "bottom";
  /**
   * Noise seed. Vary it so two edges on one screen are not the same shape —
   * the tear is deterministic, so the default repeats exactly.
   */
  seed?: number;
  /** Set the colour here, with a text utility — the SVG paints currentColor. */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Round up: a fractional width leaves a hairline of background showing at
    // the right edge on fractional-DPR displays.
    const measure = () => setWidth(Math.ceil(el.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none relative w-full overflow-hidden", className)}
      style={{ height: HEIGHT }}
    >
      <TornSurface
        // A full DEPTH taller and wider than the strip, and offset left by the
        // same, so the OTHER three tears all fall outside the clip. Only the
        // edge asked for survives; the ends of the band stay square.
        width={width + DEPTH * 2}
        height={HEIGHT + DEPTH}
        depth={DEPTH}
        seed={seed}
        className={cn("absolute -left-12", edge === "top" ? "top-0" : "bottom-0")}
      />
    </div>
  );
}
