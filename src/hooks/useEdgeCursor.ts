"use client";

import { useEffect, useRef, type RefObject } from "react";

export type EdgeZone = "prev" | "next";

/**
 * The edge cursor: a stand-in pointer that follows the mouse over the left and
 * right edges of a frame, and a click there that acts on the edge it names.
 *
 * FIRST BUILT FOR THE CAROUSEL (Souls of the Arena), and lifted out so the
 * character detail hero could use the very same behaviour rather than a copy
 * of it. The caller decides two things - which edge, if any, the pointer is on
 * (`zoneAt`) and what a click there does (`onPick`) - and this hook owns the
 * rest. The rules below were learnt on the carousel and hold for every user.
 *
 * 1. NO REACT STATE ON POINTERMOVE. The zone lives in a closure and reaches the
 *    DOM as `data-zone` on the frame and `data-dir` on the cursor, so CSS can
 *    hide the real pointer and turn the arrow. React never hears about a move;
 *    GSAP's `quickTo` writes the position on its own ticker.
 *
 * 2. EDGES ARE THE FRAME'S, NOT THE WINDOW'S. `zoneAt` is handed the frame's
 *    own rect, so the arrow never arms over the nav or another section.
 *
 * 3. THE CURSOR IS POSITIONED, NOT TRANSLATED. `xPercent`/`yPercent` centre it
 *    and compose with `x`/`y`; a Tailwind `-translate-*` class would be wiped by
 *    GSAP writing `translate: none` inline. It is `absolute` in the frame, not
 *    `fixed`, because transformed ancestors re-anchor `fixed`.
 *
 * 4. `overwrite: "auto"`, NEVER `true`, on the show/hide tween - `true` kills
 *    the two `quickTo` tweens and the cursor freezes at the origin.
 *
 * MOUSE ONLY. Gated behind `(pointer: fine)`: on touch there is nothing to
 * follow, and a stand-in parked where the last tap landed is worse than none.
 * Callers provide their own touch affordance - the carousel is swiped, the
 * detail hero draws its links as chips.
 */
export function useEdgeCursor({
  frame,
  cursor,
  zoneAt,
  onPick,
  rescan,
}: {
  frame: RefObject<HTMLElement | null>;
  cursor: RefObject<HTMLElement | null>;
  /** Which edge the pointer is on, or null. Re-run on every move. */
  zoneAt: (clientX: number, target: Element | null, rect: DOMRect) => EdgeZone | null;
  /** A click while an edge is armed. */
  onPick: (zone: EdgeZone, reduced: boolean) => void;
  /** An element whose scrolling changes the answer - the carousel's track. */
  rescan?: RefObject<HTMLElement | null>;
}) {
  // The callbacks are read through refs so a caller can pass inline functions
  // without the effect tearing down and rebuilding GSAP on every render.
  const zoneAtRef = useRef(zoneAt);
  const onPickRef = useRef(onPick);
  useEffect(() => {
    zoneAtRef.current = zoneAt;
    onPickRef.current = onPick;
  });

  useEffect(() => {
    const frameEl = frame.current;
    const cursorEl = cursor.current;
    const rescanEl = rescan?.current ?? null;
    if (!frameEl || !cursorEl) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void (async () => {
      // GSAP is already a lazy chunk on these routes. `quickTo` is core.
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Reduced motion keeps the cursor - it is an affordance - and drops the
      // lag and the scale, so it simply appears where it belongs.
      const followDuration = reduced ? 0 : 0.35;

      gsap.set(cursorEl, { xPercent: -50, yPercent: -50, scale: reduced ? 1 : 0, autoAlpha: 0 });
      const xTo = gsap.quickTo(cursorEl, "x", { duration: followDuration, ease: "power3" });
      const yTo = gsap.quickTo(cursorEl, "y", { duration: followDuration, ease: "power3" });

      let zone: EdgeZone | null = null;
      let lastX = 0;
      let lastTarget: Element | null = null;

      const setZone = (next: EdgeZone | null) => {
        if (next === zone) return;
        zone = next;
        if (next) {
          cursorEl.dataset.dir = next;
          frameEl.dataset.zone = next;
        } else {
          delete frameEl.dataset.zone;
        }
        gsap.to(cursorEl, {
          scale: next ? 1 : reduced ? 1 : 0,
          autoAlpha: next ? 1 : 0,
          duration: reduced ? 0 : 0.25,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      const test = () => setZone(zoneAtRef.current(lastX, lastTarget, frameEl.getBoundingClientRect()));

      const onMove = (event: PointerEvent) => {
        const rect = frameEl.getBoundingClientRect();
        lastX = event.clientX;
        lastTarget = event.target as Element | null;
        xTo(event.clientX - rect.left);
        yTo(event.clientY - rect.top);
        test();
      };
      const onLeave = () => setZone(null);
      const onClick = () => {
        if (zone) onPickRef.current(zone, reduced);
      };

      frameEl.addEventListener("pointermove", onMove);
      frameEl.addEventListener("pointerleave", onLeave);
      frameEl.addEventListener("click", onClick);
      // What is reachable can change under a still pointer - the carousel's
      // track scrolling to its end - so the zone is re-tested then too.
      rescanEl?.addEventListener("scroll", test, { passive: true });

      teardown = () => {
        frameEl.removeEventListener("pointermove", onMove);
        frameEl.removeEventListener("pointerleave", onLeave);
        frameEl.removeEventListener("click", onClick);
        rescanEl?.removeEventListener("scroll", test);
        gsap.killTweensOf(cursorEl);
        delete frameEl.dataset.zone;
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [frame, cursor, rescan]);
}
