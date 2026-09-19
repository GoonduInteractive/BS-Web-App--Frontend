"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * TOURNAMENT RULES and REWARDS — a bar that opens onto its content. Figma:
 * `Tournament (upcoming).png`, y 1456..2200 at 1440, both open; the ongoing
 * frame draws both closed.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   bar      79..1362 x 1456..1533 — 78 tall on --color-umber, the container's width
 *   title    ink 120..401, cap 30 at 1479 → 48px Teko, --text-h2, white; 41 in
 *   glyph    21 square at 1300..1320 — the scroll cue's arrow, `ornaments/arrow.svg`
 *   content  starts 24 under the bar, 35 in from the container's edge
 *   phone    (`tornament-mobilee.png`) bar 320 x 59 in a 20 gutter, title 29px
 *            12 in, glyph 19 wide ending 13 from the right; content 16 in, at
 *            14 / 25
 *
 * THE GLYPH POINTS DOWN WHEN CLOSED AND UP WHEN OPEN — the convention — which
 * is not quite either frame: the upcoming one draws an open bar with a down
 * glyph, the ongoing one draws two closed bars with the glyph each way. Two
 * frames, three readings; the convention is followed and FLAGGED.
 *
 * HOW IT OPENS. The panel is a one-row grid whose row goes from `0fr` to
 * `1fr`, and that is a CSS transition — the one way to animate to an unknown
 * height without measuring it, and a one-shot state change of the kind
 * `Reveal` documents: nothing to seek or scrub, so it stays out of GSAP and the
 * global reduced-motion block collapses it for free. The content fades and
 * settles a beat behind the row. While closed the panel is `inert`, so it is
 * out of the tab order and the accessibility tree, but it stays in the
 * document — a crawler reads the rules either way.
 *
 * A `button` with `aria-expanded` over the region it controls.
 */
export function TournamentAccordion({
  title,
  defaultOpen,
  expandLabel,
  collapseLabel,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  expandLabel: string;
  collapseLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group bg-umber focus-visible:outline-signal ease-gate flex h-[3.6875rem] w-full cursor-pointer items-center justify-between px-3 text-left transition-[filter] duration-300 hover:brightness-125 focus-visible:outline-2 focus-visible:-outline-offset-2 lg:h-19.5 lg:px-10"
        >
          <span className="font-display text-menu-fg text-[1.8125rem] leading-none font-semibold tracking-[-0.06em] uppercase lg:text-h2 lg:leading-[3.5rem]">
            {title}
          </span>
          <span className="sr-only">{open ? collapseLabel : expandLabel}</span>
          <Image
            src="/assets/ornaments/arrow.svg"
            alt=""
            aria-hidden
            width={23}
            height={29}
            className={cn(
              "ease-gate h-5 w-auto shrink-0 select-none transition-transform duration-300 lg:h-5.25",
              open ? "rotate-180 group-hover:-translate-y-0.5" : "group-hover:translate-y-0.5",
            )}
          />
        </button>
      </h2>
      <div
        id={panelId}
        inert={!open}
        className={cn(
          "ease-gate grid transition-[grid-template-rows] duration-400",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              "ease-gate px-4 pt-4.5 transition-[opacity,translate] duration-400 lg:px-9",
              open ? "translate-y-0 opacity-100 delay-75" : "-translate-y-2 opacity-0",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
