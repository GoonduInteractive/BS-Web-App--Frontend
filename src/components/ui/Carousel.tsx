"use client";

import Image from "next/image";
import { Children, useRef, type ReactNode } from "react";

import { useEdgeCursor } from "@/hooks/useEdgeCursor";

import { cn } from "@/lib/utils/cn";

/**
 * A horizontal carousel whose only visible control is the CURSOR ITSELF.
 *
 * Point at the left or right edge of the track and the pointer becomes an arrow;
 * click and it pages. This is the Thorgal affordance, and it is the reason there
 * are no dots and no permanent arrows - the frames have neither, and the human
 * asked for neither.
 *
 * NOT IN FIGMA. There is no designed carousel cursor, so this is built from
 * pieces the project already owns rather than invented: the hand-drawn
 * `ornaments/arrow.svg` that the scroll cue uses, turned a quarter, on the same
 * graphite plate the Souls CTA already established for this field. Ask Design
 * whether it wants something of its own.
 *
 * THE POINTER MECHANICS ARE `useEdgeCursor`, shared with the character detail
 * hero. The notes below are why it is built the way it is.
 *
 * FOUR THINGS THIS GETS RIGHT THAT THE OBVIOUS VERSION DOES NOT
 *
 * 1. NO REACT STATE ON POINTERMOVE. The obvious build calls `setCursorState` in
 *    the move handler, which re-renders the whole subtree on every mouse event
 *    and throws away exactly the performance `quickTo` was chosen for. The zone
 *    lives in a ref and reaches the DOM as a data attribute; React never hears
 *    about a mouse move. This is also the coding standard's rule for
 *    pointer-driven motion, verbatim.
 *
 * 2. THE EDGES ARE THE TRACK'S, NOT THE WINDOW'S. Measuring `clientX` against
 *    `window.innerWidth` arms the arrow at the edge of the PAGE - so it appears
 *    while the pointer is over the nav, or over a section three screens away.
 *    Every measurement here is against the frame's own `getBoundingClientRect`.
 *
 * 3. THE ARROW IS POSITIONED, NOT TRANSLATED. `-translate-x-1/2` plus a GSAP
 *    `x` tween is the trap `useGsapScene` warns about: Tailwind v4 compiles that
 *    class to the `translate` property, GSAP normalises `translate` onto its own
 *    `transform` and writes `translate: none` inline, and the centring silently
 *    dies. `xPercent`/`yPercent` are GSAP's own and compose with `x`/`y`.
 *
 *    It is also `absolute` inside the frame rather than `fixed`. A `fixed`
 *    element resolves against the nearest transformed ancestor instead of the
 *    viewport, and this page has GSAP scenes writing transforms up the tree -
 *    so `fixed` would work until it silently did not.
 *
 * 4. IT ONLY ARMS WHEN THERE IS SOMEWHERE TO GO. No overflow, no arrow; already
 *    at the end, no right arrow. At `lg` the three Souls cards fill the row
 *    exactly, so the cursor never appears there - which is correct, and falls
 *    out of the measurement rather than needing a breakpoint rule.
 *
 * REACHABLE WITHOUT A MOUSE. The track is a real scroll container with
 * `tabindex`, so it takes focus and arrow keys scroll it natively, and touch
 * swipes it. The cursor is an enhancement on top of that, gated behind
 * `(pointer: fine)`, and nothing depends on it.
 *
 * SNAP, ON ONE AXIS, DELIBERATELY. The overview forbids CSS scroll-snap because
 * Lenis and snap fight over the PAGE's vertical scroll. This is a nested
 * element on the horizontal axis; Lenis drives `window` vertically and never
 * touches it. Flagged rather than assumed - if the stutter shows up on a real
 * device, `snap-x` comes off and the arrows still page correctly.
 */
export function Carousel({
  children,
  label,
  className,
  trackClassName,
  itemClassName,
  cursorClassName,
}: {
  /** One element per slide. Each is wrapped in an `li` by this component. */
  children: ReactNode;
  /** Names the scroll region for assistive tech. Required, not decorative. */
  label: string;
  className?: string;
  /** Padding, gap and breakout live here - they are the caller's geometry. */
  trackClassName?: string;
  /** Slide width per breakpoint. The caller owns how many are in view. */
  itemClassName?: string;
  /** The arrow plate's colours, so the cursor can suit the field it sits on. */
  cursorClassName?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

  useCarouselCursor({ frame, track, cursor });

  return (
    <div
      ref={frame}
      className={cn(
        "relative",
        // The real pointer is hidden only while the arrow is standing in for it.
        "data-[zone=prev]:cursor-none data-[zone=next]:cursor-none",
        className,
      )}
    >
      <ul
        ref={track}
        tabIndex={0}
        role="group"
        aria-label={label}
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain",
          // Smooth paging, but never for someone who asked for less motion.
          "motion-safe:scroll-smooth",
          // No scrollbar: the cursor is the affordance, and a bar under the
          // cards would read as chrome the frames do not have.
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "focus-visible:outline-signal focus-visible:outline-2 focus-visible:outline-offset-4",
          trackClassName,
        )}
      >
        {Children.map(children, (child, i) => (
          <li key={i} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </li>
        ))}
      </ul>

      {/* The stand-in pointer. `group` so the arrow inside can read the
          direction off the data attribute; `pointer-events-none` so the click
          it advertises reaches the frame underneath. */}
      <div
        ref={cursor}
        aria-hidden
        data-carousel-cursor
        className={cn(
          "group pointer-events-none invisible absolute top-0 left-0 z-30 grid h-14 w-14 place-items-center rounded-full opacity-0",
          "bg-graphite",
          cursorClassName,
        )}
      >
        <Image
          src="/assets/ornaments/arrow.svg"
          alt=""
          aria-hidden
          width={23}
          height={29}
          className="h-5 w-4 select-none group-data-[dir=prev]:rotate-90 group-data-[dir=next]:-rotate-90"
        />
      </div>
    </div>
  );
}

/** Fraction of the track's width that counts as an edge, and its px ceiling. */
const EDGE_FRACTION = 0.22;
const EDGE_MAX = 180;

/** One slide plus one gap - what a click advances by. */
function pageDistance(trackEl: HTMLUListElement) {
  const first = trackEl.firstElementChild;
  if (!first) return trackEl.clientWidth;
  const gap = parseFloat(getComputedStyle(trackEl).columnGap) || 0;
  return first.getBoundingClientRect().width + gap;
}

/**
 * The carousel's edges: an arrow only where there is somewhere to go, and a
 * click pages by one slide. The pointer mechanics are the shared
 * `useEdgeCursor`; this is only the carousel's answer to "which edge" and
 * "what happens".
 */
function useCarouselCursor({
  frame,
  track,
  cursor,
}: {
  frame: React.RefObject<HTMLDivElement | null>;
  track: React.RefObject<HTMLUListElement | null>;
  cursor: React.RefObject<HTMLDivElement | null>;
}) {
  useEdgeCursor({
    frame,
    cursor,
    rescan: track,
    zoneAt: (clientX, _target, rect) => {
      const trackEl = track.current;
      if (!trackEl) return null;
      const maxScroll = trackEl.scrollWidth - trackEl.clientWidth;
      // Nothing to scroll to: no arrow. This is what keeps the three-up
      // desktop row from advertising a page that does not exist.
      if (maxScroll < 2) return null;
      const edge = Math.min(rect.width * EDGE_FRACTION, EDGE_MAX);
      if (clientX < rect.left + edge && trackEl.scrollLeft > 1) return "prev";
      if (clientX > rect.right - edge && trackEl.scrollLeft < maxScroll - 1) return "next";
      return null;
    },
    onPick: (zone, reduced) => {
      const trackEl = track.current;
      if (!trackEl) return;
      const distance = pageDistance(trackEl);
      trackEl.scrollBy({ left: zone === "prev" ? -distance : distance, behavior: reduced ? "auto" : "smooth" });
    },
  });
}
