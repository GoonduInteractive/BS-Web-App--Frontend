"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import TornSurface from "@/components/ui/TornSurface";
import { cn } from "@/lib/utils/cn";

/** The designer's tear depth, as everywhere else on this site. */
const DEPTH = 47.4;

/**
 * A full-width band whose TOP AND BOTTOM EDGES ARE TORN — the content itself,
 * not a strip laid over it.
 *
 * `TornDivider` paints a coloured strip with a torn edge and lays it over a
 * boundary, which is right when one side of the join is a flat colour: the
 * strip IS that colour, and it reads as that side tearing into the other. It is
 * wrong for OWN THE STORY, where the band is a photograph on the left and gild
 * on the right and the frame tears BOTH into the ground. A strip in the ground
 * colour laid over the band drew the ground's teeth hanging down into the band,
 * which is the tear inverted.
 *
 * So this masks. An inline SVG `<mask>` holds a `TornSurface` painted white,
 * and the band's box references it through `mask-image: url(#…)`. Whatever is
 * inside — photograph, gild, copy — is clipped to the torn shape, and the teeth
 * are the band's own content rising into the ground. Which is what a torn sheet
 * on a table looks like.
 *
 * GEOMETRY. `TornSurface` rags all four sides of a rect inset by `depth / 2`, so
 * the surface is drawn `depth` wider on each side and shifted left by `depth`:
 * its left and right tears then fall outside the band and the box stays
 * full-bleed. Top and bottom keep their teeth, centred `depth / 2` inside the
 * band's edge, which is where the frame's are.
 *
 * IT MEASURES, for the reason `TornDivider` documents: the filter's scale and
 * frequency are in user units and a stretched viewBox smears the teeth.
 *
 * THE MASK ID IS FIXED, so there can be one of these per page. A `useId()` value
 * carries colons, which `url(#…)` rejects, and an inline `style` is what the
 * coding standard reserves for GSAP. One band per page is what every frame
 * draws.
 */
const MASK_ID = "torn-band";

export function TornBand({
  children,
  seed = 3307,
  className,
}: {
  children: ReactNode;
  seed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 1440, height: 700 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox({ width: Math.ceil(r.width), height: Math.ceil(r.height) });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative [mask-image:url(#torn-band)] [mask-mode:luminance]", className)}
    >
      <svg width="0" height="0" aria-hidden className="absolute">
        <mask
          id={MASK_ID}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          x={-DEPTH}
          y={0}
          width={box.width + DEPTH * 2}
          height={box.height}
        >
          <g transform={`translate(${-DEPTH} 0)`}>
            <TornSurface
              width={box.width + DEPTH * 2}
              height={box.height}
              depth={DEPTH}
              seed={seed}
              className="text-white"
            />
          </g>
        </mask>
      </svg>
      {children}
    </div>
  );
}
