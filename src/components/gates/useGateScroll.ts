"use client";

import { useEffect, useRef } from "react";

import { useGateEntry } from "@/components/gates/GateEntry";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { getGate, nextGate, prevGate, type GateId } from "@/lib/gates";

/** Wheel travel, in px, that counts as a decision to move. A notch is ~100. */
const WHEEL_THRESHOLD = 40;
/**
 * How long the wheel must go quiet before another move is allowed. A trackpad
 * flick keeps firing momentum events for the best part of a second after the
 * fingers lift; without this one flick would travel two or three gates.
 */
const WHEEL_QUIET_MS = 220;
/** Finger travel, in px, that counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 60;

/**
 * Scroll to move between the gates (the human, 2026-09-24: "at the gate, if
 * you scroll up or down it takes you to the next gate").
 *
 * A GATE IS ONE VIEWPORT AND THE PORTAL HAS NOTHING TO SCROLL, so a scroll
 * there is read as intent: down stands the visitor at the next door, up at the
 * previous one, both through the tear, exactly as the cue and the rail do.
 * The order wraps both ways, as the cues already do (gate 4's cue reads
 * DISCOVER THE GAME).
 *
 * ONE MOVE PER GESTURE. Wheel deltas accumulate to a threshold, then input is
 * locked until the tear has finished AND the wheel has gone quiet, so a long
 * trackpad glide is one step, not a slide through all four gates. A wheel over
 * an open dialog is the dialog's, never a gate move.
 *
 * Wheel, touch and keyboard all count - the arrow keys and Page Up/Down, and
 * Space outside a control - so the move is not mouse-only. Nothing happens
 * while an overlay owns the screen: the menu locks the page's scroll on
 * <html>, and that lock is the signal.
 */
export function useGateScroll(current: GateId | null) {
  const { stepGate } = useGateEntry();
  const { busy } = usePageTransition();
  // Read through a ref so the listeners are attached once, not per gate.
  const state = useRef({ current, stepGate, busy });
  useEffect(() => {
    state.current = { current, stepGate, busy };
  });

  useEffect(() => {
    let acc = 0;
    let lockedUntilQuiet = false;
    let quietTimer: ReturnType<typeof setTimeout> | undefined;
    let touchY: number | null = null;

    // An overlay owns the screen: a dialog that is showing (the menu stays
    // mounted and hides itself with aria-hidden, so only a visible one counts),
    // or a page-level scroll lock, which the other dialogs take.
    const overlayOpen = () =>
      document.documentElement.style.overflowY === "hidden" ||
      Array.from(document.querySelectorAll('[aria-modal="true"]')).some((d) => !d.closest('[aria-hidden="true"]'));

    const go = (dir: 1 | -1) => {
      const { current: id, stepGate: step, busy: isBusy } = state.current;
      // On the entry screen there is no gate to move from: ENTER is the way in.
      if (!id || isBusy() || overlayOpen()) return false;
      const gate = getGate(id);
      // The gate rise, not the tear: the next door comes up from below, the
      // previous one down from above (see GatePortal).
      step((dir === 1 ? nextGate(gate) : prevGate(gate)).id, dir);
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      // Pinch-zoom on a trackpad arrives as ctrl+wheel; that is not a scroll.
      if (event.ctrlKey) return;
      if (overlayOpen()) return;
      // The lock lifts only once the tear has finished AND the wheel has then
      // been quiet. A quiet gap DURING the tear (a slow glide, a pause between
      // flicks) must not release it, or the glide's tail takes a second step.
      clearTimeout(quietTimer);
      const release = () => {
        if (state.current.busy()) {
          quietTimer = setTimeout(release, WHEEL_QUIET_MS);
          return;
        }
        lockedUntilQuiet = false;
        acc = 0;
      };
      quietTimer = setTimeout(release, WHEEL_QUIET_MS);
      if (lockedUntilQuiet) return;

      acc += event.deltaY;
      if (Math.abs(acc) < WHEEL_THRESHOLD) return;
      const moved = go(acc > 0 ? 1 : -1);
      acc = 0;
      if (moved) lockedUntilQuiet = true;
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - event.changedTouches[0].clientY;
      touchY = null;
      // Finger up is content moving up: the next gate.
      if (Math.abs(dy) >= SWIPE_THRESHOLD) go(dy > 0 ? 1 : -1);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      // Keys typed into a control, or Space on a button, are the control's.
      if (target?.closest("input, textarea, select, button, a, [contenteditable]")) return;
      const dir = ["ArrowDown", "PageDown", " "].includes(event.key)
        ? 1
        : ["ArrowUp", "PageUp"].includes(event.key)
          ? -1
          : 0;
      if (!dir) return;
      if (go(dir)) event.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(quietTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
}
