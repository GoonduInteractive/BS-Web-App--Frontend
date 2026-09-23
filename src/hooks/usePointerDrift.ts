"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "./useReducedMotion";

/**
 * Pointer drift - motion moment 4.
 *
 * This is what replaces the 3D environment that was evaluated and cut (overview
 * section 4). It only works because the character ships on its OWN layer:
 * `soma-gate-character.png` is 63.3% transparent and the four plates are opaque
 * backgrounds with no character baked in. That closes overview risk 7.
 *
 * Translating the two layers by different amounts against the cursor reads as
 * real depth for about thirty lines and no dependency.
 *
 * EITHER LAYER MAY BE ABSENT, and one caller needs that. The gates wire both.
 * The Game page hero wires only the back one: its plate is a single render with
 * the shrine figure baked in, so there is no second layer to separate and it
 * leans as one piece at the environment's depth. Passing only the ref you have
 * is the whole API for that.
 *
 * Written to the letter of the coding standard's rule for pointer-driven motion:
 *
 *  - `pointermove` writes to a REF, never to state. Setting state per pointer
 *    event would re-render the whole gate on every mouse move.
 *  - All DOM writes happen in ONE requestAnimationFrame loop, not in the event.
 *  - The layers LERP toward the target rather than mapping input straight to a
 *    transform, so the motion is damped instead of glued to the cursor.
 *
 * The loop parks itself when the layers are within a hair of the target, so an
 * idle page is not burning a frame callback forever.
 */

/** Fraction of the half-viewport each layer travels. Overview: 3% and 1%. */
const DEPTH = { front: 0.03, back: 0.01 } as const;

/** Lerp factor per frame. Lower is heavier. */
const DAMPING = 0.08;

/** Below this, in px, the layers are close enough and the loop can sleep. */
const REST_EPSILON = 0.01;

export function usePointerDrift<F extends HTMLElement, B extends HTMLElement>() {
  const frontRef = useRef<F>(null);
  const backRef = useRef<B>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    // Reduced motion disables this ENTIRELY, per overview section 10. It is not
    // slowed down, it does not run - the global CSS block cannot help here
    // because these are JS transform writes, not CSS transitions.
    if (reduced) return;

    // No cursor, no drift. A touch device would otherwise leave the layers
    // parked wherever the last tap landed.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const front = frontRef.current;
    const back = backRef.current;
    if (!front && !back) return;

    /** Normalised cursor offset from centre, -1 to 1. Written by the event. */
    const target = { x: 0, y: 0 };
    /** What is actually on screen. Chases `target`. */
    const current = { x: 0, y: 0 };

    let raf = 0;
    let running = false;

    const write = () => {
      // Travel is a fraction of the half-viewport, so the effect feels the same
      // on a laptop and an ultrawide.
      const spanX = window.innerWidth / 2;
      const spanY = window.innerHeight / 2;

      // Against the cursor, hence the negation - the layers lean away from the
      // pointer, which is what produces the parallax read.
      const fx = -current.x * spanX * DEPTH.front;
      const fy = -current.y * spanY * DEPTH.front;
      const bx = -current.x * spanX * DEPTH.back;
      const by = -current.y * spanY * DEPTH.back;

      if (front) front.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
      if (back) back.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
    };

    const tick = () => {
      current.x += (target.x - current.x) * DAMPING;
      current.y += (target.y - current.y) * DAMPING;
      write();

      const settled =
        Math.abs(target.x - current.x) < REST_EPSILON &&
        Math.abs(target.y - current.y) < REST_EPSILON;

      if (settled) {
        // Snap the last sub-pixel away and stop. The next pointermove restarts
        // the loop, so an idle tab costs nothing.
        current.x = target.x;
        current.y = target.y;
        write();
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
      start();
    };

    // Leaving the window returns the layers to rest rather than stranding them.
    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(raf);
      if (front) front.style.transform = "";
      if (back) back.style.transform = "";
    };
  }, [reduced]);

  return { frontRef, backRef };
}
