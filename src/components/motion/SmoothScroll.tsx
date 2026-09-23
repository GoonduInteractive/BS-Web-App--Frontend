"use client";

import { useEffect } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { setLenis } from "@/lib/animation/lenis";

/**
 * Lenis smooth scroll, mounted once from the layout.
 *
 * Deferred until now on purpose: until The Game page existed, every route was a
 * single-viewport hero with nothing to scroll, so Lenis would have been an inert
 * dependency against a tight JS budget. It earns its place now.
 *
 * DYNAMICALLY IMPORTED, like GSAP in TransitionProvider. The library is ~3KB
 * gzipped but there is no reason for it to block first paint on a metered
 * connection - smooth scroll only matters once someone scrolls.
 *
 * WIRED TO SCROLLTRIGGER, AND THAT NOTE USED TO SAY THE OPPOSITE. The old
 * reasoning - Lenis drives the real `window` scroll, so native events fire and
 * ScrollTrigger needs nothing - is true as far as it goes, and it held while the
 * only scroll-linked thing on the site was the gate rail's fade. It said "if a
 * future section pins or scrubs, that assumption needs rechecking". The gate
 * pull-up scrubs a full-viewport panel against the scroll, so this is that
 * recheck, and the answer is that it does need wiring.
 *
 * The problem is not the events, it is the CLOCKS. Lenis was running its own
 * `requestAnimationFrame` loop and GSAP was running its ticker, independently.
 * Two loops interpolating the same frame means ScrollTrigger reads a scroll
 * position Lenis has already moved past, which shows as judder on anything
 * scrubbed. Three lines fix it:
 *
 *   - `lenis.on("scroll", ScrollTrigger.update)` so triggers update on Lenis's
 *     interpolated position rather than only on native scroll events.
 *   - Lenis's `raf` driven FROM `gsap.ticker`, so there is one clock.
 *   - `lagSmoothing(0)`, because GSAP's frame-drop compensation jumps its clock
 *     forward to "catch up" and fights Lenis's easing.
 *
 * GSAP AND SCROLLTRIGGER ARE IMPORTED DYNAMICALLY HERE TOO. They are already
 * dynamic in `useGsapScene` and `TransitionProvider`, so this adds no weight to
 * the initial bundle - it joins the same chunk.
 *
 * NO CSS SCROLL-SNAP ANYWHERE. Lenis and snap fight each other and produce a
 * stuttering, fighting-the-user feel (overview, motion moment 2).
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    // Smooth scroll is exactly the kind of motion that makes people ill. Under
    // reduced motion the browser's own scrolling is the correct behaviour.
    if (reduced) return;

    let teardown: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        // Close to Lenis's defaults. The scroll should feel weighted, not slow:
        // anything heavier reads as lag rather than smoothness.
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Trackpads and touch already have OS-level inertia; adding ours on top
        // makes them feel unmoored.
        smoothWheel: true,
        syncTouch: false,
      });

      // ONE CLOCK. GSAP's ticker drives Lenis; Lenis's scroll drives
      // ScrollTrigger. `time` is seconds from the ticker and Lenis wants
      // milliseconds.
      const drive = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(drive);
      gsap.ticker.lagSmoothing(0);
      // Handed to the one reader that needs the scroller itself (the gate
      // pull-up holds the page still while it pulls). See lib/animation/lenis.
      setLenis(lenis);

      teardown = () => {
        gsap.ticker.remove(drive);
        // Put the default back rather than leaving the whole app without frame-
        // drop compensation once smooth scroll is gone.
        gsap.ticker.lagSmoothing(500, 33);
        lenis.off("scroll", ScrollTrigger.update);
        setLenis(null);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [reduced]);

  return null;
}
