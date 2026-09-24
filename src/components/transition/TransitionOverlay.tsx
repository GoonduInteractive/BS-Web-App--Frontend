"use client";

import type { RefObject } from "react";

/**
 * The two masses the tear timeline drives. Purely presentational - it owns no
 * state and starts no animation; TransitionProvider does both.
 *
 * WHY EACH PANEL IS A SOLID BLOCK PLUS A NARROW TORN STRIP
 *
 * The obvious build - stretch the artwork across the whole panel - looks wrong on
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
 * different coordinate space and destroys it - measured, 71% coverage down to 16%.
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
  topRef,
  sideRef,
  active,
}: {
  leftRef: RefObject<HTMLDivElement | null>;
  rightRef: RefObject<HTMLDivElement | null>;
  /** The sweep's two masses - see SweepPanel. */
  topRef: RefObject<HTMLDivElement | null>;
  sideRef: RefObject<HTMLDivElement | null>;
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
          load. It must NOT seed a transform - GSAP composes xPercent on top of
          any existing one, so a transform seed doubles the travel and the wipe
          stops covering. See the note in globals.css. */}
      <Panel ref={leftRef} className="tear-panel -left-[20vw]" side="left" />
      <Panel ref={rightRef} className="tear-panel -right-[20vw]" side="right" />

      {/* The sweep: a mass dropping from the top and one crossing from the
          right, which keep going after the swap rather than retreating. The top
          one is stacked over the side one, as in the reference recording. */}
      <SweepPanel ref={sideRef} axis="x" className="tear-panel" />
      <SweepPanel ref={topRef} axis="y" className="tear-panel" />
    </div>
  );
}

/** How far the sweep's solid stops short of each end, as in `Panel`. */
const SWEEP_INSET = SOLID_INSET;

/**
 * One of the sweep's two masses (2026-09-24): torn at BOTH ends.
 *
 * The classic wipe retreats the way it came, so only a panel's inner edge is
 * ever seen. The sweep passes through - in from the top and right, out at the
 * bottom and left - so the TRAILING end shows as the panel leaves, and a straight
 * edge there would give the illusion away. The reference recording's reveal is
 * exactly that trailing edge: "red receding, ragged edge descending".
 *
 * Built the way `Panel` is, mirrored: a solid block in the middle, a torn strip
 * at each end sized in `vh` so the tear reads the same on every screen, and the
 * solid reaching 15vh under each strip to hide the strip's far torn edge.
 *
 * SIZED SO THE SOLID ALONE COVERS THE VIEWPORT AT REST. The panel is the
 * viewport plus 40vh at each end and sits 40vh back, so at 0 its solid spans
 * exactly the screen and both torn ends are out of frame - full cover without
 * relying on the other panel. `xPercent`/`yPercent` of +-100 then park it a
 * whole panel-length away, fully off-screen.
 *
 * `axis="y"` travels vertically: strips top and bottom, the tear artwork
 * upright (it is horizontal as delivered). TILTED 6 DEGREES, left end low, as in
 * the reference: the red shows first along the top-LEFT and spreads right, and
 * on the way out the same slant uncovers the top-right first and leaves the
 * left side red longest. The tilt is the CSS `rotate` property, separate from
 * the `transform` GSAP writes, so the travel runs along the tilted axis and
 * the two never clobber each other. It is 130vw wide so the tilted ends stay
 * out of frame; the side mass covers the corners the tilt opens at full cover. `axis="x"` travels
 * horizontally: full height, strips left and right, the artwork turned a
 * quarter turn in CSS, for the reason given above.
 */
function SweepPanel({
  ref,
  axis,
  className,
}: {
  ref: RefObject<HTMLDivElement | null>;
  axis: "x" | "y";
  className: string;
}) {
  const vertical = axis === "y";

  return (
    <div
      ref={ref}
      className={`absolute overflow-hidden will-change-transform ${className}`}
      style={
        vertical
          ? { left: "-15vw", width: "130vw", top: `-${SWEEP_INSET}`, height: `calc(100vh + 2 * ${SWEEP_INSET})`, rotate: "-6deg" }
          : { top: 0, height: "100%", left: `-${SWEEP_INSET}`, width: `calc(100vw + 2 * ${SWEEP_INSET})` }
      }
    >
      <div
        className="bg-ember absolute"
        style={vertical ? { left: 0, right: 0, top: SWEEP_INSET, bottom: SWEEP_INSET } : { top: 0, bottom: 0, left: SWEEP_INSET, right: SWEEP_INSET }}
      />
      {(["start", "end"] as const).map((end) => (
        <div
          key={end}
          className="absolute overflow-hidden"
          style={
            vertical
              ? { left: 0, right: 0, height: STRIP, [end === "start" ? "top" : "bottom"]: 0 }
              : { top: 0, bottom: 0, width: STRIP, [end === "start" ? "left" : "right"]: 0 }
          }
        >
          <div
            data-art
            // Upright for the vertical sweep: the strip runs across the screen,
            // so the artwork's length runs across it too, at least 140vh long
            // like `Panel`'s, and wider on a screen wider than that.
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cover bg-center bg-no-repeat ${vertical ? "" : "rotate-90"}`}
            style={vertical ? { width: "max(130vw, 140vh)", height: STRIP } : { width: "140vh", height: STRIP }}
          />
        </div>
      ))}
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
