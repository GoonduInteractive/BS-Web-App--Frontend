"use client";

import type { RefObject } from "react";

/**
 * The two masses the tear timeline drives. Purely presentational — it owns no
 * state and starts no animation; TransitionProvider does both.
 *
 * WHY EACH PANEL IS A SOLID BLOCK PLUS A NARROW TORN STRIP
 *
 * The obvious build — stretch the artwork across the whole panel — looks wrong on
 * desktop. The tear is a long shape (2455x753, about 3.3:1), so if its THICKNESS
 * has to cover a 100vw-wide panel, the background magnifies enormously and crops
 * its LENGTH. Measured: at 1440px only ~24% of the tear's length was in frame,
 * against ~87% at 380px. Twenty-four percent stretched over the full screen height
 * is two or three enormous lobes, which reads as two rectangles meeting rather
 * than a tear, while mobile looked correctly ragged. Same code, opposite results.
 *
 * So the mass and the edge are separated. A solid ember block does the covering,
 * and a narrow strip carries the torn edge at the panel's inner side. The strip is
 * sized in `vh`, so the artwork is magnified the same amount at every viewport
 * width and the tear reads identically on a phone and an ultrawide.
 *
 * WHY THE ARTWORK IS NEVER ROTATED IN THE SVG
 *
 * Its raggedness is not in the path: the path is a soft blob, and an
 * feDisplacementMap driven by feTurbulence tears it. That filter's `scale` is in
 * user-space units, so rotating inside the SVG re-runs the displacement in a
 * different coordinate space and destroys it — measured, 71% coverage down to 16%.
 * The browser rasterises the file upright, where the filter behaves, and the inner
 * layer turns that finished raster a quarter turn with CSS.
 *
 * The panels OVERLAP rather than interlock, per Design, and overhang the viewport
 * so the artwork's outer torn edge is never in frame.
 *
 * z-50 puts the red above the site header: Design confirmed the header sits behind
 * the overlay.
 */

/** Visual width of the torn strip. In vh so the tear looks the same everywhere. */
const STRIP = "55vh";
/** How far the solid block reaches under the strip, hiding its outer torn edge. */
const SOLID_INSET = "40vh";

export function TransitionOverlay({
  leftRef,
  rightRef,
  active,
}: {
  leftRef: RefObject<HTMLDivElement | null>;
  rightRef: RefObject<HTMLDivElement | null>;
  active: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 overflow-hidden ${active ? "" : "pointer-events-none"}`}
    >
      {/* `tear-panel` seeds opacity:0. Without it the two overlapping 100vw
          panels cover the whole viewport in ember until GSAP's idle-time
          gsap.set lands, which paints every route solid red on a slow first
          load. It must NOT seed a transform — GSAP composes xPercent on top of
          any existing one, so a transform seed doubles the travel and the wipe
          stops covering. See the note in globals.css. */}
      <Panel ref={leftRef} className="tear-panel -left-[20vw]" side="left" />
      <Panel ref={rightRef} className="tear-panel -right-[20vw]" side="right" />
    </div>
  );
}

function Panel({
  ref,
  className,
  side,
}: {
  ref: RefObject<HTMLDivElement | null>;
  className: string;
  /** Which side of the panel faces the centre of the screen. */
  side: "left" | "right";
}) {
  const inner = side === "left" ? "right-0" : "left-0";
  const outer = side === "left" ? "left-0" : "right-0";

  return (
    <div
      ref={ref}
      className={`absolute top-0 h-full w-[100vw] overflow-hidden will-change-transform ${className}`}
    >
      {/* The mass. Reaches under the strip so the strip's outer torn edge, which
          should never be seen, has solid ember behind it. */}
      <div
        className={`bg-ember absolute inset-y-0 ${outer}`}
        style={{ width: `calc(100% - ${SOLID_INSET})` }}
      />

      {/* The edge. */}
      <div className={`absolute inset-y-0 ${inner} overflow-hidden`} style={{ width: STRIP }}>
        <div
          data-art
          // Width and height are swapped because the layer is turned a quarter
          // turn: its box is authored pre-rotation, so its width becomes the
          // visual height and vice versa. 140vh of length against a 55vh strip
          // puts the artwork at a fixed magnification, independent of viewport.
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-cover bg-center bg-no-repeat"
          style={{ width: "140vh", height: STRIP }}
        />
      </div>
    </div>
  );
}
