import { pickVariant } from "@/components/transition/tear-variants";
import { DURATION, EASE, gsap, OPEN_TIMESCALE, RIGHT_PANEL_LEAD } from "./gsap";

/**
 * The signature red torn wipe (overview section 9, motion moment 1).
 *
 * ONE TIMELINE, PLAYED THEN REVERSED. Two masses close from the left and right
 * edges to cover the screen, the route swaps, then the same two masses retreat
 * the way they came and reveal the new page along the identical seam.
 *
 * Reversing is not a shortcut, it is the requirement. The effect depends on the
 * screen reopening along the exact tear it closed along; picking a fresh variant
 * for the open would change the seam while it was hidden and the illusion would
 * collapse. Reversing the same timeline makes that impossible to get wrong.
 *
 * It also buys the easing. A reversed `power3.in` plays decelerating, which is
 * the ease-out the open needs, and `timeScale` makes the open faster than the
 * close without authoring a second timeline.
 *
 * The torn edge is a FIXED SHAPE THAT TRANSLATES. Path data is never touched.
 * Morphing would need the paid MorphSVG plugin, run on the main thread and
 * repaint every frame, for an effect nobody could distinguish from moving it.
 */
export type TearPanels = {
  left: HTMLElement | null;
  right: HTMLElement | null;
};

type Options = { reduced: boolean };

/** The rotatable layer inside a panel. The panel itself is reserved for GSAP. */
function art(panel: HTMLElement): HTMLElement {
  const el = panel.querySelector<HTMLElement>("[data-art]");
  if (!el) throw new Error("Tear panel has no art layer");
  return el;
}

function assertPanels(panels: TearPanels) {
  const { left, right } = panels;
  if (!left || !right) throw new Error("Tear panels are not mounted");
  return { left, right };
}

/** Parks both panels off-screen. Safe to call at any point. */
export function resetPanels(panels: TearPanels) {
  const { left, right } = assertPanels(panels);
  // autoAlpha stays 1: visibility:hidden would skip rasterisation and undo the
  // idle warm-up of the displacement filter.
  gsap.set(left, { xPercent: -100, autoAlpha: 1 });
  gsap.set(right, { xPercent: 100, autoAlpha: 1 });
}

/** Jump straight to fully covered, no animation. Used for back and forward. */
export function coverInstantly(panels: TearPanels) {
  const { left, right } = assertPanels(panels);
  gsap.set([left, right], { xPercent: 0, autoAlpha: 1 });
}

/**
 * Builds the close as a paused timeline. Play it forward to cover, then
 * `.timeScale(OPEN_TIMESCALE).reverse()` to reveal along the same seam.
 */
export function createTear(panels: TearPanels, { reduced }: Options) {
  const { left, right } = assertPanels(panels);

  // Picked ONCE, here, and held for both directions. Each panel picks its own
  // edge: sharing one would make the two masses exact mirror twins.
  const leftEdge = pickVariant();
  const rightEdge = pickVariant();
  gsap.set(art(left), {
    backgroundImage: `url(${leftEdge.src})`,
    scaleY: leftEdge.flipped ? -1 : 1,
  });
  gsap.set(art(right), {
    backgroundImage: `url(${rightEdge.src})`,
    scaleY: rightEdge.flipped ? -1 : 1,
  });

  if (reduced) {
    // A 0.01ms tear is a red flash, worse than no transition at all for anyone
    // motion-sensitive. Cross-fade in place instead of travelling.
    gsap.set([left, right], { xPercent: 0, autoAlpha: 0 });
    return gsap
      .timeline({ paused: true })
      .to([left, right], { autoAlpha: 1, duration: DURATION.tearFade, ease: EASE.fade });
  }

  gsap.set(left, { xPercent: -100, autoAlpha: 1 });
  gsap.set(right, { xPercent: 100, autoAlpha: 1 });

  return gsap
    .timeline({ paused: true })
    .to(right, { xPercent: 0, duration: DURATION.tearClose, ease: EASE.tearClose }, 0)
    .to(left, { xPercent: 0, duration: DURATION.tearClose, ease: EASE.tearClose }, RIGHT_PANEL_LEAD);
}

export { OPEN_TIMESCALE };
