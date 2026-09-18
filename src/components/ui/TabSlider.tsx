"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * The underline that slides between tabs — the 1px line with 2px end ticks
 * `PanelTab` draws under the active tab, lifted out of the tab so that when
 * the choice changes it travels to the new tab instead of vanishing from one
 * and appearing under the other. At the human's direction ("a cool
 * animation, that seems like a swap").
 *
 * It sits absolutely in the tablist (which must be `relative`) and is placed
 * by measurement: the active tab's offset box, written as `left`, `top` and
 * `width` before paint, and transitioned on later moves. A ResizeObserver
 * re-measures on any relayout — a font swap, a wrap, the viewport. The tabs
 * keep their own underline slot for height, drawn invisible, so nothing
 * shifts when this replaces it.
 *
 * Decorative: the tab's `aria-selected` carries the state.
 */
export function TabSlider({ activeId }: { activeId: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const slider = ref.current;
    const list = slider?.parentElement;
    if (!slider || !list) return;

    const place = () => {
      const tab = document.getElementById(activeId);
      if (!tab || tab.parentElement !== list) return;
      // The tab's own (invisible) underline is its last child; the slider
      // takes exactly that box. The slot's distance from the TAB's top is read
      // as a difference of rects — its `offsetTop` is against the nearest
      // positioned ancestor, which is the list, not the tab, so a list with
      // top padding had that padding counted twice and the underline sat a
      // padding's height under its tab (the Competition bar, 61px).
      const slot = tab.lastElementChild as HTMLElement | null;
      const inTab = slot ? slot.getBoundingClientRect().top - tab.getBoundingClientRect().top : tab.offsetHeight - 6;
      const top = tab.offsetTop + inTab;
      slider.style.left = `${tab.offsetLeft}px`;
      slider.style.top = `${top}px`;
      slider.style.width = `${tab.offsetWidth}px`;
      slider.dataset.placed = "";
    };

    place();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeId]);

  return (
    <span
      ref={ref}
      aria-hidden
      className="border-signal ease-gate pointer-events-none absolute h-1.5 border-x-2 opacity-0 transition-[left,width,opacity] duration-400 data-placed:opacity-100 motion-reduce:transition-none"
    >
      <span className="bg-signal absolute inset-x-0 top-0.5 h-px" />
    </span>
  );
}
