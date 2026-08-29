"use client";

import Image from "next/image";
import { Children, useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A horizontal carousel whose only visible control is the CURSOR ITSELF.
 *
 * Point at the left or right edge of the track and the pointer becomes an arrow;
 * click and it pages. This is the Thorgal affordance, and it is the reason there
 * are no dots and no permanent arrows — the frames have neither, and the human
 * asked for neither.
 *
 * NOT IN FIGMA. There is no designed carousel cursor, so this is built from
 * pieces the project already owns rather than invented: the hand-drawn
 * `ornaments/arrow.svg` that the scroll cue uses, turned a quarter, on the same
 * graphite plate the Souls CTA already established for this field. Ask Design
 * whether it wants something of its own.
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
 *    `window.innerWidth` arms the arrow at the edge of the PAGE — so it appears
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
 *    viewport, and this page has GSAP scenes writing transforms up the tree —
 *    so `fixed` would work until it silently did not.
 *
 * 4. IT ONLY ARMS WHEN THERE IS SOMEWHERE TO GO. No overflow, no arrow; already
 *    at the end, no right arrow. At `lg` the three Souls cards fill the row
 *    exactly, so the cursor never appears there — which is correct, and falls
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
 * touches it. Flagged rather than assumed — if the stutter shows up on a real
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
  /** Padding, gap and breakout live here — they are the caller's geometry. */
  trackClassName?: string;
  /** Slide width per breakpoint. The caller owns how many are in view. */
  itemClassName?: string;
  /** The arrow plate's colours, so the cursor can suit the field it sits on. */
  cursorClassName?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

  useEdgeCursor({ frame, track, cursor });

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

function useEdgeCursor({
  frame,
  track,
  cursor,
}: {
  frame: React.RefObject<HTMLDivElement | null>;
  track: React.RefObject<HTMLUListElement | null>;
  cursor: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const frameEl = frame.current;
    const trackEl = track.current;
    const cursorEl = cursor.current;
    if (!frameEl || !trackEl || !cursorEl) return;

    // No cursor, no cursor affordance. On touch the track is swiped directly,
    // and a stand-in pointer parked wherever the last tap landed is worse than
    // none at all.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void (async () => {
      // GSAP is already a lazy chunk on this route. `quickTo` is core, no plugin.
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Reduced motion keeps the arrow — it is an affordance, not decoration —
      // and drops the lag and the scale, so it simply appears where it belongs.
      const followDuration = reduced ? 0 : 0.35;

      gsap.set(cursorEl, { xPercent: -50, yPercent: -50, scale: reduced ? 1 : 0, autoAlpha: 0 });
      const xTo = gsap.quickTo(cursorEl, "x", { duration: followDuration, ease: "power3" });
      const yTo = gsap.quickTo(cursorEl, "y", { duration: followDuration, ease: "power3" });

      let zone: "prev" | "next" | null = null;
      let lastX = 0;

      const zoneAt = (clientX: number) => {
        const rect = frameEl.getBoundingClientRect();
        const maxScroll = trackEl.scrollWidth - trackEl.clientWidth;
        // Nothing to scroll to: no arrow. This is what keeps the three-up
        // desktop row from advertising a page that does not exist.
        if (maxScroll < 2) return null;
        const edge = Math.min(rect.width * EDGE_FRACTION, EDGE_MAX);
        if (clientX < rect.left + edge && trackEl.scrollLeft > 1) return "prev";
        if (clientX > rect.right - edge && trackEl.scrollLeft < maxScroll - 1) return "next";
        return null;
      };

      const setZone = (next: "prev" | "next" | null) => {
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
          // "auto", NEVER `true`. `overwrite: true` kills every other tween of
          // the target, which here means the two `quickTo` tweens driving x and
          // y — the arrow appears, then sits frozen at the origin and never
          // follows the pointer. "auto" only overwrites the properties that
          // actually conflict, so scale and autoAlpha are claimed and the
          // position tweens are left running.
          overwrite: "auto",
        });
      };

      /** One slide plus one gap — what a click advances by. */
      const pageDistance = () => {
        const first = trackEl.firstElementChild;
        if (!first) return trackEl.clientWidth;
        const gap = parseFloat(getComputedStyle(trackEl).columnGap) || 0;
        return first.getBoundingClientRect().width + gap;
      };

      const onMove = (event: PointerEvent) => {
        const rect = frameEl.getBoundingClientRect();
        lastX = event.clientX;
        // quickTo only records the target; the write happens on GSAP's own
        // ticker, so this handler does no layout and no DOM writing.
        xTo(event.clientX - rect.left);
        yTo(event.clientY - rect.top);
        setZone(zoneAt(event.clientX));
      };

      const onLeave = () => setZone(null);

      // The reachable end moves as the track scrolls, so the zone has to be
      // re-tested against the pointer's last known position, not just on move.
      const onScroll = () => setZone(zoneAt(lastX));

      const onClick = () => {
        if (!zone) return;
        const distance = pageDistance();
        trackEl.scrollBy({
          left: zone === "prev" ? -distance : distance,
          behavior: reduced ? "auto" : "smooth",
        });
      };

      frameEl.addEventListener("pointermove", onMove);
      frameEl.addEventListener("pointerleave", onLeave);
      frameEl.addEventListener("click", onClick);
      trackEl.addEventListener("scroll", onScroll, { passive: true });

      teardown = () => {
        frameEl.removeEventListener("pointermove", onMove);
        frameEl.removeEventListener("pointerleave", onLeave);
        frameEl.removeEventListener("click", onClick);
        trackEl.removeEventListener("scroll", onScroll);
        gsap.killTweensOf(cursorEl);
        delete frameEl.dataset.zone;
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [frame, track, cursor]);
}
