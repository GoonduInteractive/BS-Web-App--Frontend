"use client";

import { usePathname } from "next/navigation";

import { homeHref, useGateEntry } from "@/components/gates/GateEntry";
import { cn } from "@/lib/utils/cn";
import { GATES, type GateId } from "@/lib/gates";

/**
 * The gate rail — a fixed stack at the lower right naming the four gates and
 * marking which one you are standing at. Figma: `02-gates/game.png`
 * (2026-09-11), which replaced the left-edge panel of the first frames.
 *
 * WHAT THE FRAME MEASURES, at 1440 x 941:
 *
 *   rows      four, 47 apart, right-aligned; label then a 12px mark column
 *             centred on x 1357, the whole thing ending 62 from the right edge
 *             and the last row's centre 149 from the bottom
 *   active    a full-round pill 118 x 31 (1260..1378 x 638..670) of near-black
 *             glass over the plate, 16 of padding each side; the label 14px
 *             Host Grotesk in --color-mist; the mark a red 12px ring around a
 *             red 8px dot, both --color-signal exactly
 *   inactive  12px labels and a 10px ring, both the plate's white at about
 *             half strength (they read #8a8977 and #787971 over the greens)
 *
 * IT IS A NAV, NOT A STEPPER. Any gate is reachable from any other; The Game
 * straight to Competition is a normal interaction. So there is no previous/next
 * logic here and no directional variation in the tear — every jump looks
 * identical regardless of distance or direction.
 *
 * IT BELONGS TO THE GATE, NOT TO THE SITE. Present while the portal stands at
 * a door, absent on the entry screen and on every page — a read of `shown` and
 * the route.
 *
 * WHY IT LIVES IN THE LAYOUT
 *
 * This is mounted once from `layout.tsx` (via SiteChrome) and never from a gate
 * page. If each page rendered its own rail it would unmount and remount across
 * the tear, risking a flash on either side of the wipe. Because it persists and
 * the tear is fully opaque at its midpoint, the active item swaps while hidden:
 * the highlight is simply already correct when the screen reopens.
 *
 * WHY EVERY ITEM IS A BUTTON. The four doors share one URL (see GateEntry), so
 * an item changes which door the portal shows rather than where you are;
 * `showGate` plays the tear around the swap. The active item is a no-op:
 * `reveal` would tear to the same face, so it is not asked to.
 *
 * Desktop only, from `lg`; gate navigation on small screens lives in the menu
 * overlay. The breakpoint is written out literally because Tailwind scans
 * source statically.
 */

export function GateRail({
  railLabel,
  labels,
}: {
  railLabel: string;
  labels: Record<GateId, string>;
}) {
  const pathname = usePathname();
  const { shown, showGate } = useGateEntry();

  // Only on the portal, and only once it stands at a door: the entry screen has
  // no rail, and past a door it is not that page's navigation.
  if (pathname !== homeHref(pathname) || !shown) return null;

  return (
    <nav aria-label={railLabel} className="fixed right-[3.875rem] bottom-[7.8125rem] z-30 hidden lg:block">
      <ul className="flex flex-col items-end">
        {GATES.map((gate) => {
          const isActive = gate.id === shown;
          return (
            <li key={gate.id} className="flex h-[2.9375rem] items-center">
              <button
                type="button"
                onClick={() => !isActive && showGate(gate.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "font-body focus-visible:outline-signal group flex cursor-pointer items-center gap-3 px-4 leading-none whitespace-nowrap transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive
                    ? "bg-ink/60 text-mist h-[1.9375rem] rounded-full text-[0.875rem] backdrop-blur-xs"
                    : "text-menu-fg/55 hover:text-menu-fg/85 text-[0.75rem]",
                )}
              >
                <span>{labels[gate.id]}</span>
                {/* The mark. Decorative: aria-current carries the state, so the
                    dot is never the only signal. One 12px slot for both so the
                    column stays on one line whatever the row's state. */}
                <span aria-hidden className="grid size-3 shrink-0 place-items-center">
                  {isActive ? (
                    <span className="border-signal grid size-3 place-items-center rounded-full border">
                      <span className="bg-signal size-2 rounded-full" />
                    </span>
                  ) : (
                    <span className="border-menu-fg/55 group-hover:border-menu-fg/85 size-2.5 rounded-full border transition-colors duration-150 ease-gate" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
