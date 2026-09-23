import type { SceneBuilder } from "@/hooks/useGsapScene";

/**
 * The Community page's GSAP choreography, in one place. Built through
 * `useGsapScene` like the Competition scenes: lazy, scoped, reverted on
 * unmount, never built on an element without a box, and every scene with its
 * own reduced-motion branch (the global CSS block cannot touch what GSAP
 * writes inline).
 *
 * Same two conventions as `competition-scenes.ts`: tween WRAPPERS, never the
 * element that hovers (GSAP zeroes Tailwind's `translate`/`scale` inline), and
 * clear only the props a tween wrote - the note wrappers are positioned by
 * inline `left`/`top` that React writes and `clearProps: "all"` would take
 * them with it.
 */

const CONDITIONS = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
};

const REST = { clearProps: "opacity,transform,transformOrigin" };

/**
 * The wall deals its notes. Whatever is inside the window when the wall first
 * has a box pins itself to the board - a ripple from the middle outward, each
 * note settling from a hair of tilt and a touch smaller, the way paper lands
 * under a thumb. Notes off-screen are left alone: the visitor pans to them,
 * and a board is not a slideshow. Plays once; panning never re-triggers it.
 */
const wallDeal: SceneBuilder = (gsap, q, root) => {
  const wrappers = q("[data-note]") as HTMLElement[];
  if (!wrappers.length) return;

  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    if ((ctx.conditions as { reduced: boolean }).reduced) {
      gsap.set(wrappers, REST);
      return;
    }
    const box = root.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const pad = 120;
    const seen = wrappers
      .map((el) => {
        const r = el.getBoundingClientRect();
        const inside = r.right > box.left - pad && r.left < box.right + pad && r.bottom > box.top - pad && r.top < box.bottom + pad;
        const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
        return { el, inside, d };
      })
      .filter((n) => n.inside)
      .sort((a, b) => a.d - b.d)
      .map((n) => n.el);
    if (!seen.length) return;

    gsap.from(seen, {
      opacity: 0,
      scale: 0.92,
      rotation: () => gsap.utils.random(-2.5, 2.5),
      transformOrigin: "50% 50%",
      duration: 0.55,
      ease: "back.out(1.4)",
      stagger: 0.045,
      ...REST,
    });
  });
};

export const COMMUNITY_SCENES = { wallDeal } as const;
export type CommunityScene = keyof typeof COMMUNITY_SCENES;
