"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { getLenis } from "@/lib/animation/lenis";
import type { LegalSection } from "@/types/legal";

/**
 * The document's own nav, beside the text. Figma:
 * `context/design/terms/Terms & Conditions.png` - a 193px column of 42px items
 * on a 50px pitch, the one you are reading filled in `--color-ember`.
 *
 * IT IS STICKY, and that is a decision rather than the frame's (a frame cannot
 * show scrolling). The human asked directly: the page is 4243px tall, so a nav
 * that scrolls away after the first section is dead weight for the rest of it,
 * and the frame's own filled state only means anything if it is on screen
 * while you read. NOT RENDERED BELOW `lg` - the mobile frame has no nav at
 * all, just the sections stacked.
 *
 * THE FILL FOLLOWS THE READER. An IntersectionObserver watches every section
 * and the nav fills whichever is nearest the top of the viewport, so the
 * answer to "where am I" is always right, including when the visitor scrolls
 * by hand rather than clicking. One observer for the page, no scroll handler,
 * nothing recomputed per frame.
 *
 * CLICKING GOES THROUGH LENIS where Lenis exists, because a page with smooth
 * scroll and a native `scrollIntoView` fight each other and the jump stutters.
 * Under reduced motion Lenis is never created, `getLenis()` is null, and the
 * browser's own instant jump is exactly right.
 */
/** What the fixed header covers - the offset an anchor has to clear. */
const HEADER = 120;

export function LegalNav({ sections }: { sections: readonly LegalSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    /**
     * The section you are reading is the LAST one whose heading has passed
     * under the fixed header - not "the first one intersecting", which leaves
     * the fill stranded wherever it last landed whenever no heading happens to
     * be inside the band (at the top of the page, and in the middle of any
     * section longer than the viewport). Reading the rects costs eight calls
     * and only runs when a heading actually crosses.
     */
    const compute = () => {
      // AT THE FOOT OF THE PAGE THE LAST SECTION WINS. It is usually short -
      // Contact Us is three lines - so it can never reach the top of the
      // viewport, and without this the nav fills the section above it for the
      // whole time you are looking straight at it.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        setActive(sections[sections.length - 1]?.id ?? "");
        return;
      }

      let current = sections[0]?.id ?? "";
      for (const section of sections) {
        const el = document.getElementById(section.id);
        // A hair of tolerance: a click lands the heading exactly ON the line,
        // and without it the rounding picks the section above the one asked for.
        if (el && el.getBoundingClientRect().top <= HEADER + 8) current = section.id;
      }
      setActive(current);
    };

    const observer = new IntersectionObserver(compute, {
      rootMargin: `-${HEADER}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    compute();
    // The foot of the page is a scroll position rather than a crossing, so it
    // needs the scroll itself; passive, and it only sets state when the answer
    // changes, which React already collapses.
    window.addEventListener("scroll", compute, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", compute);
    };
  }, [sections]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    const lenis = getLenis();
    if (!el || !lenis) return; // no Lenis: let the browser follow the anchor
    event.preventDefault();
    // THE TARGET IS A NUMBER, not the element: asked to scroll to an element
    // with `offset: -HEADER`, Lenis left the heading 100px below where it was
    // asked for (measured: 220 against the 120 wanted), and the nav then filled
    // the section above the one clicked. The position computed here is exactly
    // where `scroll-mt` would have put it.
    lenis.scrollTo(el.getBoundingClientRect().top + window.scrollY - HEADER);
    setActive(id);
  };

  return (
    <nav aria-label={sections[0]?.navLabel ? "Sections" : undefined} className="hidden lg:block">
      {/* Sticky below the fixed header, and tall enough to hold every item. */}
      <ul className="sticky top-32 flex flex-col gap-2">
        {sections.map((section) => {
          const isActive = section.id === active;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(event) => go(event, section.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "font-body text-body-sm ease-gate focus-visible:outline-signal flex h-10.5 items-center px-3 leading-none transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive ? "bg-ember text-menu-fg" : "text-menu-fg/85 hover:text-menu-fg",
                )}
              >
                {section.navLabel}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
