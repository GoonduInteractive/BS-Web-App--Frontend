"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The sideways scroller the bracket tree sits in, opened on its MIDDLE.
 *
 * The frame draws the tree cut at both edges of the page - the round of 16
 * running off the left, the finals off the right - which a scroller cannot do
 * on its own: an overflowing box starts at its left edge and can only ever be
 * cut on the right. So once it has laid out, this scrolls itself to the centre,
 * and the tree shows both its ends cut exactly as the comp does, with either
 * side a scroll away. Once, on mount; a visitor's scroll is theirs after that.
 *
 * Without JavaScript it is an ordinary scroller opened on the left, which is
 * still the whole tree - and so is the phone, on purpose: its frame shows the
 * round of 16 at the left with the stubs running off the right, so below `lg`
 * nothing is centred.
 */
export function BracketScroller({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(min-width: 64rem)").matches) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
