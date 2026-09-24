"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type RefObject } from "react";

import { usePageTransition } from "@/components/transition/TransitionProvider";
import { TornPlate } from "@/components/ui/TornPlate";
import { useEdgeCursor } from "@/hooks/useEdgeCursor";
import { withName } from "@/lib/characters";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";

export type AdjacentLinks = {
  prev: { name: string; href: string };
  next: { name: string; href: string };
};

/** Fraction of the hero's width that counts as an edge, and its px ceiling. */
const EDGE_FRACTION = 0.16;
const EDGE_MAX = 220;

/**
 * Anything the reader might be reading or clicking. Over these the edge does
 * not arm: the real pointer stays, text can be selected, and BACK still goes
 * back rather than to the previous character.
 */
const NOT_AN_EDGE = "a, button, h1, p, dl, [data-edge-ignore]";

/**
 * Previous and next character, from the hero's edges (the human, 2026-09-24).
 *
 * THE SAME CURSOR AS SOULS OF THE ARENA - `useEdgeCursor`, shared with the
 * carousel - asked for LARGER and suited to this page. The carousel's graphite
 * disc would all but vanish on this dark red field, so the stand-in here wears
 * the page's own chip: the torn gild plate the BACK chip sits on, with the
 * scroll cue's hand-drawn arrow inked black, and the name of where the click
 * goes. NOT IN FIGMA, like the carousel's cursor; built from pieces the page
 * already owns. Ask Design whether it wants something of its own.
 *
 * TWO AFFORDANCES, ONE PAIR OF LINKS.
 *   - A mouse gets the cursor, at every width. A click on an armed edge goes
 *     through `navigate()`, so it plays the red wipe like any link on the site.
 *   - Touch has no pointer to follow, so the same links are drawn as chips in
 *     the hero's bottom corners. On a mouse device they are screen-reader-only
 *     until focused, so keyboard users get them too.
 *
 * The order wraps (see `getAdjacentCharacters`), so there is always a next and
 * a previous while the roster has more than one character.
 */
export function DetailEdgeNav({
  frame,
  adjacent,
  messages,
}: {
  /** The hero section: the cursor's frame and its positioning context. */
  frame: RefObject<HTMLElement | null>;
  adjacent: AdjacentLinks;
  messages: Messages;
}) {
  const t = messages.characters.detail;
  const cursor = useRef<HTMLDivElement>(null);
  const { navigate } = usePageTransition();

  useEdgeCursor({
    frame,
    cursor,
    zoneAt: (clientX, target, rect) => {
      if (target?.closest(NOT_AN_EDGE)) return null;
      const edge = Math.min(rect.width * EDGE_FRACTION, EDGE_MAX);
      if (clientX < rect.left + edge) return "prev";
      if (clientX > rect.right - edge) return "next";
      return null;
    },
    onPick: (zone) => navigate(adjacent[zone].href),
  });

  return (
    <>
      {/* The stand-in pointer. `group` so each half can read the direction off
          `data-dir`; `pointer-events-none` so the click reaches the section.

          A ZERO-SIZE POINT, WITH THE PLATE HUNG OFF IT INWARD. Centred on the
          pointer like the carousel's disc, a plate this wide would be half cut
          off at the very edge it is advertising. So the followed element is the
          pointer itself, and the plate opens away from the edge: rightward from
          the left edge, leftward from the right, arrow at the pointer end. The
          hook's scale tween then grows it out of the pointer. */}
      <div
        ref={cursor}
        aria-hidden
        className="group pointer-events-none invisible absolute top-0 left-0 z-30 size-0 opacity-0"
      >
        <div className="text-ink absolute top-0 isolate flex h-24 -translate-y-1/2 items-center gap-5 px-8 group-data-[dir=next]:right-0 group-data-[dir=next]:flex-row-reverse group-data-[dir=prev]:left-0">
          <TornPlate className="text-gild drop-shadow-[0_10px_24px_rgb(0_0_0/0.45)]" />
          <Arrow className="h-9 w-7" />
          <span className="flex flex-col gap-1.5 whitespace-nowrap group-data-[dir=next]:items-end">
            <span className="font-body text-caption leading-none font-semibold tracking-[0.12em]">
              <span className="hidden group-data-[dir=prev]:inline">{t.prev}</span>
              <span className="hidden group-data-[dir=next]:inline">{t.next}</span>
            </span>
            <span className="font-display text-h5 leading-none font-semibold uppercase">
              <span className="hidden group-data-[dir=prev]:inline">{adjacent.prev.name}</span>
              <span className="hidden group-data-[dir=next]:inline">{adjacent.next.name}</span>
            </span>
          </span>
        </div>
      </div>

      {/* The same two links as chips, for touch and for the keyboard. They sit
          above the torn edge at the foot of the hero, over the figure. */}
      <nav
        aria-label={`${t.prev} / ${t.next}`}
        className="pointer-events-none absolute inset-x-6 bottom-20 z-30 flex justify-between lg:inset-x-10 lg:bottom-24"
      >
        <EdgeChip dir="prev" href={adjacent.prev.href} name={adjacent.prev.name} label={withName(t.prevLabel, adjacent.prev.name)} />
        <EdgeChip dir="next" href={adjacent.next.href} name={adjacent.next.name} label={withName(t.nextLabel, adjacent.next.name)} />
      </nav>
    </>
  );
}

function EdgeChip({ dir, href, name, label }: { dir: "prev" | "next"; href: string; name: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      data-edge-ignore
      className={cn(
        "text-ink focus-visible:outline-signal pointer-events-auto relative isolate inline-flex h-11 items-center gap-2.5 px-4 transition-opacity duration-150 ease-gate hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4",
        dir === "next" && "flex-row-reverse",
        // A mouse has the cursor; the chip is for the keyboard, so it stays
        // out of sight until it takes focus.
        "pointer-fine:sr-only pointer-fine:focus-visible:not-sr-only",
      )}
    >
      <TornPlate className="text-gild" />
      <Arrow dir={dir} className="h-5 w-4" />
      <span className="font-display text-h6 max-w-32 truncate leading-none font-semibold uppercase">{name}</span>
    </Link>
  );
}

/**
 * The scroll cue's hand-drawn arrow, turned to point along the row and inked
 * black for the gild plate - the delivered file is white and points down.
 * Without `dir` it turns from the cursor's `data-dir`.
 */
function Arrow({ dir, className }: { dir?: "prev" | "next"; className?: string }) {
  return (
    <Image
      src="/assets/ornaments/arrow.svg"
      alt=""
      aria-hidden
      width={23}
      height={29}
      className={cn(
        "shrink-0 brightness-0 select-none",
        dir === "prev" && "rotate-90",
        dir === "next" && "-rotate-90",
        !dir && "group-data-[dir=prev]:rotate-90 group-data-[dir=next]:-rotate-90",
        className,
      )}
    />
  );
}
