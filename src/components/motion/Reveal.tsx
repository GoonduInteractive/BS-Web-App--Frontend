"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Reveal on enter - the page's one scroll motion.
 *
 * Content rises and fades as its section comes into view, once, and then stays
 * put. Nothing re-animates on the way back up.
 *
 * WHY AN OBSERVER AND NOT SCROLLTRIGGER
 *
 * This is a one-shot state change, not a timeline: there is nothing to seek,
 * reverse or scrub. An IntersectionObserver flips one attribute and the CSS in
 * globals.css does the animation, which keeps GSAP and ScrollTrigger out of the
 * initial bundle. They are currently loaded lazily for the gate rail alone, and
 * putting every heading and paragraph on this page through ScrollTrigger would
 * undo that on a page already close to its JS ceiling.
 *
 * The observer disconnects the moment it fires, so nothing is left watching.
 *
 * `delay` staggers siblings within a section. Keep the steps small - this is a
 * reveal, not a sequence, and long chains read as the page being slow.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Rendered element. Use the semantic tag, not a wrapper div, where possible. */
  as?: ElementType;
  /** Stagger in milliseconds. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already in view on load (the hero), or the browser has no observer:
    // show immediately rather than waiting for a scroll that may never come.
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.reveal = "shown";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      // Fire a little before the element is fully in view, so the movement is
      // finishing as the reader arrives rather than starting.
      //
      // THE BOTTOM INSET IS IN PIXELS, AND MUST STAY SMALL. It was -10%, which
      // is unreachable for anything sitting in the bottom tenth of the viewport
      // at maximum scroll: the scroll cue at the foot of the page landed at
      // top 816 in a 900px viewport against a root shrunk to 810, so it never
      // intersected and never appeared. A percentage scales with the viewport
      // while a page's trailing padding does not, which is what made it a trap.
      // 40px keeps the "arrive as it finishes" feel and stays well inside any
      // realistic bottom padding.
      { rootMargin: "0px 0px -40px 0px", threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
