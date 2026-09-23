"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A sideways scroller for something wider than the screen - the leaderboard's
 * tables on a phone - built the way the character modal's bio scrolls
 * (2026-09-16, at the human's direction: "use the same one used in the
 * character modal"):
 *
 *  - a thin scrollbar in the content's own grey (`--color-steel`, the table's
 *    dividers) on nothing, instead of the browser's default bar;
 *  - the end with more content behind it FADES, so the cut-off reads as "there
 *    is more this way" rather than as the table ending - the left edge once
 *    scrolled, the right edge until the end, both in between;
 *  - `overscroll-behavior` contains the gesture, so reaching the end does not
 *    hand the swipe to the page.
 *
 * The state is two facts read off the scroller itself, on layout and on scroll,
 * written as one data attribute the classes key off. No React state: a render
 * per scroll event is the one thing this must not cost. Where the content fits
 * (`lg`, where the tables are `overflow-visible` for the rows' hover pop) the
 * attribute is removed and nothing masks.
 */
export function SideScroller({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const left = el.scrollLeft > 4;
      const right = el.scrollWidth - el.clientWidth - el.scrollLeft > 4;
      const more = left && right ? "both" : left ? "left" : right ? "right" : null;
      if (more) el.dataset.more = more;
      else delete el.dataset.more;
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-x-auto overscroll-x-contain [scrollbar-color:var(--color-steel)_transparent] [scrollbar-width:thin]",
        "data-[more=right]:[mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)]",
        "data-[more=left]:[mask-image:linear-gradient(to_right,transparent,black_3rem)]",
        "data-[more=both]:[mask-image:linear-gradient(to_right,transparent,black_3rem,black_calc(100%-3rem),transparent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
