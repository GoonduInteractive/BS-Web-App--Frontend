"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import TornSurface from "@/components/ui/TornSurface";
import { cn } from "@/lib/utils/cn";

/**
 * A torn sheet behind arbitrary content, at whatever size the content needs.
 *
 * WHY NOT `TornPlate`. That one stretches a 96x30 viewBox, and both the
 * displacement scale and the noise frequency are in user units - blown up to a
 * 453x261 panel its teeth become 38px wide and 70px deep, which reads as a
 * ripped poster rather than the fine deckle edge the frames draw. Same trap
 * `TornDivider` documents. The fix is the same: measure the box and hand
 * `TornSurface` real pixels.
 *
 * The defaults are the delivered `merch/tear-bg.svg` filter's own values -
 * `scale="20"`, `baseFrequency="0.05"`, `seed="4428"` - so this reproduces that
 * artwork procedurally instead of shipping it as a bitmap that would band.
 *
 * Colour is `currentColor`: set it with a `text-*` token on this element.
 *
 * MEASURED IN LAYOUT PIXELS, NOT SCREEN PIXELS. The surface is positioned in
 * this element's own coordinate space, so it has to be the size the element
 * IS, not the size it appears - inside a scaled ancestor (the community wall
 * draws its whole canvas at 0.62 on a phone) `getBoundingClientRect()` returns
 * the transformed box, and a surface drawn to that came out 62% of its card
 * with the note's text running off the paper (the human's phone screenshot,
 * 2026-09-16). `offsetWidth` / `offsetHeight` are the border box before any
 * transform; the observer's callback still measures the same way.
 */
export function TornPanel({
  children,
  seed = 4428,
  depth = 20,
  frequency = 0.05,
  bleed,
  className,
}: {
  children: ReactNode;
  seed?: number;
  depth?: number;
  frequency?: number;
  /**
   * How far the surface is drawn OUTSIDE the content box, so the teeth bite at
   * the box edge rather than inside it.
   *
   * TornSurface insets its rect by depth/2 to keep the displacement in bounds,
   * which means an un-bled panel paints 10px short of its own edge on every
   * side - visible as a plate floating in a hole. Bleeding by the same amount
   * puts the rect back on the edge and lets the tear swing both ways.
   */
  bleed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      setBox({ width: el.offsetWidth, height: el.offsetHeight });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const out = bleed ?? depth / 2;

  return (
    <div ref={ref} className={cn("relative isolate", className)}>
      {/* Drawn before the first measurement at zero size, which paints nothing -
          better than a full-width flash of the wrong shape. */}
      {box.width > 0 ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -z-10"
          style={{ left: -out, top: -out }}
        >
          <TornSurface
            width={box.width + out * 2}
            height={box.height + out * 2}
            depth={depth}
            frequency={frequency}
            seed={seed}
          />
        </span>
      ) : null}
      {children}
    </div>
  );
}
