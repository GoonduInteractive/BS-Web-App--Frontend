import { gsap } from "gsap";

/**
 * Shared GSAP setup. Core only - no ScrollTrigger, which arrives with the gate
 * sequence and must be imported individually when it does (overview section 10).
 *
 * The coding standard puts shared easings and durations in globals.css as
 * tokens. That rule is about CSS animation; GSAP eases are JS strings and its
 * durations are seconds, neither of which a CSS custom property can express in
 * a form GSAP consumes. They live here instead, in one place, for the same
 * reason: no magic numbers scattered through components.
 */
export { gsap };

/** Seconds. Measured from the prototype recording, not estimated. */
export const DURATION = {
  /**
   * The close. Both masses meeting in the middle.
   *
   * The prototype reading was 0.5s with power3.in, but power3 concentrates almost
   * all of its travel into the final third, so the motion read as a snap rather
   * than a sweep. Softening the curve to power2.in and lengthening to 0.8s spends
   * that time on visible movement instead of on imperceptible drift.
   */
  tearClose: 0.8,
  /** Reduced-motion substitute for both phases. */
  tearFade: 0.15,
} as const;

/**
 * The open is the close reversed and sped up. It stays quicker than the close, as
 * the design asks, but 1.45 was too aggressive: a reversed ease decelerates, so
 * the reveal did all its travel up front and spent its last 145ms moving less
 * than a pixel. Perceptible reveal was 200ms against a nominal 345ms. At 1.15 the
 * open is 0.70s and nearly all of it is visible.
 */
export const OPEN_TIMESCALE = 1.15;

export const EASE = {
  /**
   * In, not out - the masses still accelerate into the meeting point. power2
   * rather than power3: the same duration, but the travel is spread across it
   * instead of arriving all at once.
   */
  tearClose: "power2.in",
  // No separate open ease: reversing power3.in plays it decelerating, which is
  // exactly the ease-out feel the open needs.
  fade: "none",
} as const;

/**
 * The right panel leads the left. Perfectly synchronised panels read as
 * mechanical; the spec calls for 40 to 60ms.
 */
export const RIGHT_PANEL_LEAD = 0.05;
