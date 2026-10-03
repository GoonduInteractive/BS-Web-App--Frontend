"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";

export type GateRiseTearHandle = {
  /**
   * Draw the band on the rising gate's leading edge.
   *
   * `edge` is where the gate's box meets the old gate, in viewport px - its
   * top when rising (`dir` 1), its bottom when coming down (-1). `rise` is the
   * arch: the ends of the edge sit `rise` in from `edge`, the crown on it.
   * `thickness` is how far the band reaches out beyond the edge (and the same
   * again in, under the gate, where it is hidden). `width` is the gate's.
   */
  draw: (edge: number, rise: number, thickness: number, width: number) => void;
};

/**
 * The red torn band that leads a gate rise - the tear, riding the arch.
 *
 * WHY IT IS BUILT, NOT A TEAR ASSET. The delivered tear art is a straight strip
 * and the gate's edge is a parabola that relaxes as it travels; a raster cannot
 * follow that. So the band is drawn here as a path along the same parabola, and
 * torn the way the art itself is torn: its raggedness is not in the artwork's
 * path either, it is `feTurbulence` fractal noise driving an
 * `feDisplacementMap` (see `public/assets/ornaments/tear-horizontal-1.svg`).
 * Same recipe, same ember, so it reads as the same tear.
 *
 * THE NOISE TRAVELS WITH THE BAND. The path is drawn in local coordinates and
 * moved by its `transform`, and a filter works in the user space of the
 * element it is on - so the ragged pattern is carried along rather than the
 * edge crawling through a noise field fixed to the screen. Only the arch depth
 * reshapes the path each frame.
 *
 * It sits between the two gate layers: over the one being left, under the one
 * arriving, so the inner half of the band is covered and only its outer, torn
 * edge shows. Decorative, and gone once the gate lands.
 */
export function GateRiseTear({ ref, dir }: { ref: Ref<GateRiseTearHandle>; dir: 1 | -1 }) {
  // `useId` can contain characters that are not safe inside `url(#...)`.
  const filterId = `gate-rise-tear-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const path = useRef<SVGPathElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      draw(edge, rise, thickness, width) {
        const el = path.current;
        if (!el) return;
        const mid = width / 2;
        // In the band's own space the edge's crown is at 0 and its ends are
        // `rise` in from it (a quadratic's midpoint sits halfway to its control
        // point, so a control point 2x the rise out draws the 4x(1-x) curve).
        // The outer boundary is that curve moved `thickness` out, the inner one
        // `thickness` in.
        const s = dir; // 1: in is down, out is up. -1: the reverse.
        const outer = (y: number) => y - s * thickness;
        const inner = (y: number) => y + s * thickness;
        const end = s * rise;
        const control = -s * rise;
        el.setAttribute(
          "d",
          `M0 ${outer(end)} Q ${mid} ${outer(control)} ${width} ${outer(end)} ` +
            `L ${width} ${inner(end)} Q ${mid} ${inner(control)} 0 ${inner(end)} Z`,
        );
        el.setAttribute("transform", `translate(0 ${edge})`);
      },
    }),
    [dir],
  );

  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-visible">
      <defs>
        {/* Region padded well past the band's box so the displacement, up to
            half of TEAR_SCALE either way, is never clipped flat. */}
        <filter id={filterId} x="-5%" y="-60%" width="110%" height="220%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={TEAR_FREQUENCY} numOctaves={3} seed={3137} />
          <feDisplacementMap in="SourceGraphic" scale={TEAR_SCALE} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path ref={path} className="fill-ember" filter={`url(#${filterId})`} />
    </svg>
  );
}

/**
 * The tear's grain. The delivered art uses 0.0129 / 60, but in its own
 * 2455-unit space rendered magnified; these are the same look in screen px.
 */
const TEAR_FREQUENCY = 0.02;
const TEAR_SCALE = 40;
