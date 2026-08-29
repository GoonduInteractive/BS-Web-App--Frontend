"use client";

import { useEffect } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Lenis smooth scroll, mounted once from the layout.
 *
 * Deferred until now on purpose: until The Game page existed, every route was a
 * single-viewport hero with nothing to scroll, so Lenis would have been an inert
 * dependency against a tight JS budget. It earns its place now.
 *
 * DYNAMICALLY IMPORTED, like GSAP in TransitionProvider. The library is ~3KB
 * gzipped but there is no reason for it to block first paint on a metered
 * connection — smooth scroll only matters once someone scrolls.
 *
 * NO SCROLLTRIGGER WIRING NEEDED. Lenis drives the real `window` scroll rather
 * than transforming a wrapper, so native scroll events still fire and the gate
 * rail's ScrollTrigger keeps working untouched. If a future section pins or
 * scrubs, that assumption needs rechecking.
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

    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let frame = 0;
    let cancelled = false;

    void (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;

      lenis = new Lenis({
        // Close to Lenis's defaults. The scroll should feel weighted, not slow:
        // anything heavier reads as lag rather than smoothness.
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Trackpads and touch already have OS-level inertia; adding ours on top
        // makes them feel unmoored.
        smoothWheel: true,
        syncTouch: false,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, [reduced]);

  return null;
}
