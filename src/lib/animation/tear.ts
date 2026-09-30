import { pickVariant } from "@/components/transition/tear-variants";
import { DURATION, EASE, gsap, OPEN_TIMESCALE, RIGHT_PANEL_LEAD } from "./gsap";

/**
 * The signature red torn wipe (overview section 9, motion moment 1).
 *
 * TWO FLOWS, TAKING TURNS (the human, 2026-09-24: "leave it as it is, but add
 * a new direction flow, so it alternates between the current one and that
 * one"). Each navigation plays the next one in the rotation.
 *
 * CLASSIC - the original, unchanged. Two masses close from the left and right
 * edges, the route swaps, then the same two masses retreat the way they came
 * and reveal the new page along the identical seam. ONE TIMELINE, PLAYED THEN
 * REVERSED: the effect depends on reopening along the exact tear it closed
 * along, and reversing the same timeline makes that impossible to get wrong. A
 * reversed `power3.in` also plays decelerating, which is the ease-out the open
 * needs, and `timeScale` makes the open faster than the close.
 *
 * SWEEP - new, read off the human's reference recording. One mass drops from
 * the top and one crosses from the right; after the swap they KEEP GOING, down
 * and out to the left, so the page is uncovered from the top right and the
 * last red leaves at the bottom left ("red receding, ragged edge descending").
 * It passes through rather than retreating, so it cannot be a reversed
 * timeline: the open is its own. The panels are torn at both ends for that
 * reason (see SweepPanel).
 *
 * The torn edge is a FIXED SHAPE THAT TRANSLATES in both flows. Path data is
 * never touched: morphing would need the paid MorphSVG plugin, run on the main
 * thread and repaint every frame, for an effect nobody could distinguish.
 */
export type TearPanels = {
  left: HTMLElement | null;
  right: HTMLElement | null;
  /** The sweep's masses. */
  top: HTMLElement | null;
  side: HTMLElement | null;
};

/** The panels once mounted. */
type Mounted = { [K in keyof TearPanels]: HTMLElement };

type Options = { reduced: boolean };

/**
 * One navigation's wipe. `close` is played forward to cover; `open` reveals
 * and calls `onDone` once the panels are parked again. `coverNow` jumps to
 * fully covered with no animation, for back and forward.
 */
export type Tear = {
  close: gsap.core.Timeline;
  open: (onDone: () => void) => void;
  coverNow: () => void;
};

/** Every art layer inside a panel. The panel itself is reserved for GSAP. */
function arts(panel: HTMLElement): HTMLElement[] {
  const els = Array.from(panel.querySelectorAll<HTMLElement>("[data-art]"));
  if (!els.length) throw new Error("Tear panel has no art layer");
  return els;
}

function assertPanels(panels: TearPanels) {
  const { left, right, top, side } = panels;
  if (!left || !right || !top || !side) throw new Error("Tear panels are not mounted");
  return { left, right, top, side };
}

/** Parks every panel off-screen. Safe to call at any point. */
export function resetPanels(panels: TearPanels) {
  const { left, right, top, side } = assertPanels(panels);
  // autoAlpha stays 1: visibility:hidden would skip rasterisation and undo the
  // idle warm-up of the displacement filter.
  gsap.set(left, { xPercent: -100, yPercent: 0, autoAlpha: 1 });
  gsap.set(right, { xPercent: 100, yPercent: 0, autoAlpha: 1 });
  gsap.set(top, { yPercent: -100, xPercent: 0, autoAlpha: 1 });
  gsap.set(side, { xPercent: 100, yPercent: 0, autoAlpha: 1 });
}

/** Each art layer gets its own edge, so no two ends are mirror twins. */
function dressEdges(panel: HTMLElement, flipAxis: "scaleX" | "scaleY") {
  for (const layer of arts(panel)) {
    const edge = pickVariant();
    gsap.set(layer, { backgroundImage: `url(${edge.src})`, [flipAxis]: edge.flipped ? -1 : 1 });
  }
}

/** Which flow the next navigation plays. Module state: it persists across routes. */
let turn = 0;

export function createTear(panels: TearPanels, { reduced }: Options): Tear {
  const p = assertPanels(panels);
  const flow = turn++ % 2 === 0 ? "classic" : "sweep";
  return flow === "classic" ? classicTear(p, reduced) : sweepTear(p, reduced);
}

/**
 * The classic flow on demand, WITHOUT taking a turn in the rotation. The gate
 * rise uses it to split its red open: it covers the screen with its own sheet,
 * then hands over to these panels at full cover and plays their open.
 */
export function createClassicTear(panels: TearPanels, { reduced }: Options): Tear {
  return classicTear(assertPanels(panels), reduced);
}

/** A reduced-motion cross-fade of the given masses, shared by both flows. */
function fadeTear(masses: HTMLElement[], all: Mounted): Tear {
  // A 0.01ms tear is a red flash, worse than no transition at all for anyone
  // motion-sensitive. Cross-fade in place instead of travelling.
  gsap.set(masses, { xPercent: 0, yPercent: 0, autoAlpha: 0 });
  const close = gsap
    .timeline({ paused: true })
    .to(masses, { autoAlpha: 1, duration: DURATION.tearFade, ease: EASE.fade });
  return {
    close,
    coverNow: () => close.progress(1).pause(),
    open: (onDone) => {
      close.eventCallback("onReverseComplete", () => {
        resetPanels(all);
        onDone();
      });
      close.timeScale(OPEN_TIMESCALE).reverse();
    },
  };
}

/** The original flow, exactly as it was: left and right, closed then reversed. */
function classicTear(all: Mounted, reduced: boolean): Tear {
  const { left, right } = all;

  // Picked ONCE, here, and held for both directions. Each panel picks its own
  // edge: sharing one would make the two masses exact mirror twins.
  dressEdges(left, "scaleY");
  dressEdges(right, "scaleY");

  if (reduced) return fadeTear([left, right], all);

  gsap.set(left, { xPercent: -100, autoAlpha: 1 });
  gsap.set(right, { xPercent: 100, autoAlpha: 1 });

  const close = gsap
    .timeline({ paused: true })
    .to(right, { xPercent: 0, duration: DURATION.tearClose, ease: EASE.tearClose }, 0)
    .to(left, { xPercent: 0, duration: DURATION.tearClose, ease: EASE.tearClose }, RIGHT_PANEL_LEAD);

  return {
    close,
    coverNow: () => {
      close.progress(1).pause();
      gsap.set([left, right], { xPercent: 0, autoAlpha: 1 });
    },
    open: (onDone) => {
      // Reveal along the same seam that closed, by reversing the same timeline.
      close.eventCallback("onReverseComplete", () => {
        resetPanels(all);
        onDone();
      });
      close.timeScale(OPEN_TIMESCALE).reverse();
    },
  };
}

/**
 * The sweep: in from the top and the right, out at the bottom and the left.
 *
 * THE TOP MASS LEADS, as in the reference, where the red first shows along the
 * top-left before the right-hand mass arrives; the right-hand one follows by the
 * classic flow's own lead. On the way out they leave together, the top one
 * dropping clear first because it has further to go.
 *
 * SAME DURATIONS AND EASES AS THE CLASSIC FLOW, so the two read as one family
 * and the covered beat lands at the same moment. The exit uses the mirror ease
 * (`power2.out`) at the classic open's speed-up, which is what the classic
 * open's reversed `power2.in` amounts to.
 */
function sweepTear(all: Mounted, reduced: boolean): Tear {
  const { top, side } = all;

  // The flip is on the axis the mass does NOT travel along.
  dressEdges(top, "scaleX");
  dressEdges(side, "scaleY");

  if (reduced) return fadeTear([top, side], all);

  gsap.set(top, { yPercent: -100, xPercent: 0, autoAlpha: 1 });
  gsap.set(side, { xPercent: 100, yPercent: 0, autoAlpha: 1 });

  const close = gsap
    .timeline({ paused: true })
    .to(top, { yPercent: 0, duration: DURATION.tearClose, ease: EASE.tearClose }, 0)
    .to(side, { xPercent: 0, duration: DURATION.tearClose, ease: EASE.tearClose }, RIGHT_PANEL_LEAD);

  return {
    close,
    coverNow: () => {
      close.progress(1).pause();
      gsap.set([top, side], { xPercent: 0, yPercent: 0, autoAlpha: 1 });
    },
    open: (onDone) => {
      const exit = DURATION.tearClose / OPEN_TIMESCALE;
      gsap
        .timeline({
          onComplete: () => {
            resetPanels(all);
            onDone();
          },
        })
        .to(top, { yPercent: 100, duration: exit, ease: "power2.out" }, 0)
        .to(side, { xPercent: -100, duration: exit, ease: "power2.out" }, RIGHT_PANEL_LEAD);
    },
  };
}

export { OPEN_TIMESCALE };
