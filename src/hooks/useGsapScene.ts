"use client";

import { useEffect, type RefObject } from "react";

/**
 * Build a scroll-driven GSAP scene for one section, safely.
 *
 * Every section that wants a timeline or a scrub goes through here rather than
 * calling GSAP directly, because there are four things that all of them have to
 * get right and only one obvious way to get each wrong.
 *
 * 1. DYNAMIC IMPORT. GSAP is ~27KB gzipped and ScrollTrigger another ~11KB.
 *    This is a content site on metered Nigerian data and neither belongs in the
 *    initial bundle for motion that only matters once someone scrolls. Same
 *    reasoning, and the same pattern, as TransitionProvider's tear.
 *
 * 2. NOTHING IS BUILT UNTIL THE SECTION HAS A BOX, and that is not a
 *    micro-optimisation - it is the difference between a scene working and not
 *    existing. This page's two faces are swapped with `hidden` (see GateView),
 *    so until the visitor is through the gate every section below the gate is
 *    `display: none` and every measurement in it is zero. ScrollTrigger caches
 *    start and end positions at creation: built while hidden, it resolves
 *    "top 72%" against a zero-height element at position zero, which is already
 *    "past". A `once` entrance then fires and finishes where nobody can see it,
 *    and a scrub runs against a range it measured as empty. Both were observed
 *    on Answer the Summons before this guard existed - the copy simply appeared,
 *    and the figure sat pinned at the far end of its drift.
 *
 *    A ResizeObserver reports nothing for a `display: none` element and fires
 *    the moment one gets a box, so it is exactly the signal needed. It stays
 *    connected afterwards and refreshes on any later relayout: going back to the
 *    gate and through it again, a font swap, an image finally decoding.
 *
 * 3. CLEANUP. Everything is created inside `gsap.context`, so one `revert()`
 *    undoes the tweens AND kills the triggers.
 *
 * 4. EXACTLY ONE BUILD PER ELEMENT. Two racing callers each creating a context
 *    is not a wasted cycle, it is an invisible section: the second context's
 *    `from()` tweens read the first's start value as their END. See the guard
 *    in `build` for why this only ever bit the one route with no gate in front
 *    of it.
 *
 * WHAT IT DOES NOT DO is decide anything about the motion. `scene` receives the
 * live `gsap`, a selector scoped to the section, and the section element itself
 * to hang triggers on, and owns the choreography - including its own
 * `matchMedia` branch for reduced motion, which is required rather than optional
 * (overview section 10).
 *
 * The element is passed IN rather than the scene reaching for the ref, so a
 * scene stays a pure function of what it is given and nothing reads a ref during
 * render.
 *
 * A WARNING WORTH REPEATING AT EVERY CALL SITE: do not tween an element whose
 * own CSS uses `translate`, `scale` or `rotate`. GSAP normalises those onto its
 * `transform` and writes `translate: none; rotate: none; scale: none` inline,
 * and an inline style beats a class. Tailwind v4 compiles `translate-x-*`,
 * `scale-*` and `-scale-x-*` to exactly those properties, so tweening such an
 * element silently kills its hover state and any mirroring. That is what broke
 * BracketButton's brackets the first time the Summons scene touched them: the
 * right bracket stopped being mirrored and the hover spread stopped moving.
 * Tween a WRAPPER instead.
 */
export type SceneBuilder = (
  gsap: typeof import("gsap").gsap,
  q: (selector: string) => Element[],
  section: HTMLElement,
) => void;

export function useGsapScene(
  root: RefObject<HTMLElement | null>,
  scene: SceneBuilder,
) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let refresh: (() => void) | undefined;
    let building = false;

    const build = async () => {
      // ONE CONTEXT PER ELEMENT, AND THE GUARD IS NOT DEFENSIVE - IT IS
      // LOAD-BEARING. The direct call below and the observer's first callback
      // both fire before the dynamic import resolves, so without this they each
      // create a context. That means two sets of `from()` tweens on the same
      // nodes, and the second reads the first's start value as its END: the
      // section animates to opacity 0 and stays there, invisible.
      //
      // It never surfaced on The Game or The Characters because their sections
      // mount inside a closed gate at `display: none` - `laidOut()` is false,
      // the direct call is skipped, and only the observer ever builds. About is
      // the first route with no gate in front of it.
      if (building || ctx) return;
      building = true;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) {
        building = false;
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      refresh = () => ScrollTrigger.refresh();

      ctx = gsap.context(() => {
        scene(gsap, gsap.utils.selector(el), el);
      }, el);
      building = false;
    };

    const laidOut = () => el.getBoundingClientRect().height > 0;

    // Already visible - arriving from a page that was open, or a browser with no
    // ResizeObserver, where waiting would mean never building at all.
    if (laidOut() || typeof ResizeObserver === "undefined") void build();

    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(() => {
            if (!laidOut()) return;
            if (ctx) refresh?.();
            else void build();
          });
    observer?.observe(el);

    return () => {
      cancelled = true;
      observer?.disconnect();
      ctx?.revert();
    };
    // `scene` is intentionally not a dependency: it is redeclared on every
    // render, and re-running would tear the whole scene down on each one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);
}
