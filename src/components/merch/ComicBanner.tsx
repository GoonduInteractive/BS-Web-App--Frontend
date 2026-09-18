"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import TornSurface from "@/components/ui/TornSurface";
import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue } from "@/types/merch";

/** The designer's tear depth, as everywhere else on this site. */
const DEPTH = 47.4;

/**
 * A comic issue as a LANDSCAPE banner. Figma: the news cards on
 * `context/design/08-news/News.png` — "Registration opens for the Eastern
 * Province Cup" and "Combat update 1.1 released".
 *
 * This is a second composition, not `ComicCover` turned on its side. The band
 * holds the chip and title on the LEFT, its right edge is torn VERTICALLY, and
 * the figure sits beside it on the field.
 *
 * HOW A VERTICAL TEAR IS MADE FROM A SHAPE THAT TEARS ALL FOUR SIDES.
 * `TornSurface` rags every edge of its rect, so the trick — the same one
 * `TornDivider` uses for horizontal edges — is to draw it larger than the frame
 * and let `overflow-hidden` remove the edges that are not wanted. Drawn `DEPTH`
 * wider and `DEPTH` taller on both axes and offset up and left by `DEPTH`, the
 * left, top and bottom tears all fall outside the panel and only the right one
 * survives.
 *
 * THE OFFSETS ACCOUNT FOR THE RECT'S OWN INSET. `TornSurface` insets its rect
 * by `depth / 2` so the displacement cannot clip at the viewBox bounds, which
 * means the right torn edge falls at `width - depth / 2`, not at `width`.
 * Solving for the edge landing on the panel's right edge gives a surface
 * `depth * 1.5` wider than the panel; getting that wrong by the inset is what
 * puts the tear a visible 24px inside the panel.
 *
 * IT MEASURES RATHER THAN STRETCHES, for the reason `TornDivider` documents:
 * `feDisplacementMap`'s scale and `feTurbulence`'s baseFrequency are in user
 * units, so a stretched viewBox smears the teeth into streaks. Passing real
 * pixels keeps the tear a constant physical size at every card width.
 */
export function ComicBanner({
  issue,
  messages,
  priority = false,
}: {
  issue: ComicIssue;
  messages: Messages;
  priority?: boolean;
}) {
  const t = messages.merch.comics;
  const copy = t.issues[issue.copyKey as keyof typeof t.issues];
  const { cover } = issue;

  const panel = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 300, height: 235 });

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox({ width: Math.ceil(r.width), height: Math.ceil(r.height) });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`@container relative h-full w-full overflow-hidden ${cover.field}`}>
      {/* The figure, on the field, filling the banner. The band then covers its
          left half, so what reads is the art to the right of the tear. */}
      <Image
        src={cover.figure}
        alt={copy.coverAlt}
        fill
        priority={priority}
        sizes="(max-width: 767px) 92vw, 46vw"
        // The render carries transparent padding, so contain leaves the figure short
          // of the banner's height. The scale closes that; it rides on the `scale`
          // property, which is separate from `transform` in v4.
          className="scale-[1.28] object-contain object-[76%_center] select-none"
      />

      {/* The band, with only its right edge torn. */}
      <div ref={panel} className="absolute inset-y-0 left-0 w-[41%] overflow-hidden">
        <TornSurface
          width={box.width + DEPTH * 1.5}
          height={box.height + DEPTH * 3}
          depth={DEPTH}
          seed={issue.volume * 913}
          className={`absolute -top-[47.4px] -left-[47.4px] ${cover.seam}`}
        />
      </div>

      <div className="absolute inset-y-0 left-0 flex w-[41%] flex-col justify-center px-[4.4cqw]">
        <span
          className={`font-display inline-grid w-fit place-items-center bg-size-[100%_100%] bg-center bg-no-repeat px-[2.4cqw] py-[1.3cqw] text-[1.9cqw] leading-none font-bold tracking-[0.08em] ${cover.chip}`}
        >
          {copy.volume}
        </span>

        <h3 className="font-display text-menu-fg mt-[3cqw] text-[10cqw] leading-[1.05] font-semibold tracking-[-0.03em] uppercase">
          {copy.coverTitle.split("\n").map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
      </div>

      <p className="text-menu-fg/80 font-body absolute bottom-[5%] left-[4.4cqw] z-1 text-[1.9cqw] leading-none">
        {t.partner}
      </p>
    </div>
  );
}
