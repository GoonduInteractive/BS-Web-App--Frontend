"use client";

import { useEffect } from "react";

import { getLenis } from "@/lib/animation/lenis";

/**
 * Hold the page still behind an open dialog — and let the dialog scroll.
 *
 * Two scrollers have to be told. The browser's is held with `overflow: hidden`
 * ON THE ROOT, not on body: `html` carries `overflow-x: hidden` for the ghosted
 * titles, and once the root has an overflow of its own, body's never propagates
 * to the viewport — so a body lock locks nothing. That was the bug all three
 * dialogs shared: every wheel over a sheet moved the page behind it.
 *
 * Lenis is the other. It would take every wheel event for itself, so it is
 * stopped for the dialog's lifetime and started again after. A dialog's own
 * scroller then needs `data-lenis-prevent` on it — Lenis's way of saying "not
 * yours" — which lets the wheel through to it untouched, and which Lenis
 * checks BEFORE it checks whether it is stopped. Under reduced motion there is
 * no Lenis and the root lock alone does the job.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const { overflowY } = root.style;
    root.style.overflowY = "hidden";
    getLenis()?.stop();
    return () => {
      root.style.overflowY = overflowY;
      getLenis()?.start();
    };
  }, [active]);
}
