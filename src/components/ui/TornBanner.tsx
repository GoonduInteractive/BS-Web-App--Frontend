"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import TornSurface from "@/components/ui/TornSurface";
import { isRemoteImage } from "@/lib/utils/remote-image";

/** The designer's tear depth, as everywhere else on this site. */
const DEPTH = 47.4;

/**
 * How far inside the panel the torn edge sits. The displacement rags the edge
 * both ways, so an edge placed exactly on the panel's clip line shows only the
 * inward half of each tooth - a few pixels of nibble. Ten pixels in and the
 * whole bite is visible, which is what the frame draws (its teeth span about
 * 12px at 1440).
 */
const BITE = 10;

/**
 * The band's width. The frame draws it about 215px wide on BOTH the 519-wide
 * card and the 410-wide one - a fixed width, not a share - so it is 215px
 * wherever that lands between 41% (the wide card, and the detail cover) and
 * 55% (so a phone card keeps most of its picture). One value, used twice.
 */
const BAND_WIDTH = "w-[clamp(41%,215px,55%)]";

/**
 * THE TITLE IS SIZED TO FIT ITS BAND, because the editor writes it and it can
 * be any length. "BETWEEN" or "REGISTRATION OPENS FOR THE EASTERN PROVINCE CUP"
 * both have to sit inside the band with nothing hanging out of it.
 *
 * The band's narrowest share of the banner is 41% (the clamp above), and it
 * pads 4.4cqw each side, so the text has 32.2cqw to live in at worst. Teko's
 * capitals measure 0.38 to 0.47em each at this tracking - measured in the
 * browser on the real face, not taken from the metrics - so at 0.47 for the
 * widest, a word of L letters needs L x 0.47 x size, and
 *
 *   size = (32.2 x 0.95) / (L x 0.47), capped at the frame's 11.8cqw
 *
 * is the largest that cannot overflow - the 0.95 keeping a hair of air at the
 * torn edge rather than filling the band to its last pixel. The table below is
 * that arithmetic, written out: Tailwind scans source text, so a computed
 * `text-[${n}cqw]` would generate nothing. The LONGEST WORD drives it,
 * because a line of several words wraps inside the band on its own; the floor
 * keeps a pathological word legible and `break-words` on the heading stops
 * even that from bleeding out.
 *
 * AND THEN TO ITS HEIGHT (the human, 2026-11-26: a long title - "Beyond Service
 * beta launches at Aniwe Xchange Abuja" - wrapped to eight lines and ran over
 * the author). Width alone can't know how many lines a title will take, so the
 * banner measures it in the browser: starting from the width's size, it steps
 * down the table until the title's foot clears the author line (or, without
 * one, the banner's foot) by 3% of the height. It measures again when the
 * banner changes size and once the display face has loaded, since Teko's
 * fallback sets wider. The table runs on below the width's floor for this: a
 * long title on the short wide card can need 2.6cqw.
 *
 * WHY 11.8cqw IS ONLY A CAP. It is the frame's own title size, read off the
 * card, and it holds for a short title - but the frame's face sets narrower
 * than Teko at the same cap height, so at 11.8 a seven-letter word already runs
 * 14% past the band (394px of text in a 345px band, measured). FLAGGED: the
 * frame's exact type width cannot be reproduced with Teko; fitting the band is
 * the closer reading of the design, since the frame's title fills its band.
 */
const TITLE_SIZE = [
  "text-[11.8cqw]", // 1-5 letters: the frame's size, and the cap
  "text-[10.9cqw]", // 6
  "text-[9.3cqw]", // 7
  "text-[8.1cqw]", // 8
  "text-[7.2cqw]", // 9
  "text-[6.5cqw]", // 10
  "text-[5.9cqw]", // 11
  "text-[5.4cqw]", // 12
  "text-[5.0cqw]", // 13
  "text-[4.6cqw]", // 14
  "text-[4.3cqw]", // 15 or more: the width's floor, with break-words behind it
  // Below here only for height: a title of many lines (see above).
  "text-[4.0cqw]",
  "text-[3.7cqw]",
  "text-[3.4cqw]",
  "text-[3.1cqw]",
  "text-[2.8cqw]",
  "text-[2.6cqw]",
] as const;

/** The longest word's step: the largest size at which no word overflows the band. */
const WIDTH_FLOOR = 10;
function widthStep(title: string): number {
  const longest = title.split(/\s+/).reduce((n, word) => Math.max(n, word.length), 0);
  return longest <= 5 ? 0 : Math.min(longest - 5, WIDTH_FLOOR);
}

/**
 * A LANDSCAPE torn banner. Figma: the news cards on
 * `context/design/08-news/News.png` - "Registration opens for the Eastern
 * Province Cup" and "Combat update 1.1 released".
 *
 * A band on the LEFT holds a volume chip, a title and an author line, its
 * right edge is torn VERTICALLY, and the picture sits beside it on the field.
 * It takes plain props so that both a merch comic issue (`ComicBanner`) and a
 * CMS article whose admin chose the torn cover can draw one; it knows nothing
 * about where the words came from.
 *
 * HOW A VERTICAL TEAR IS MADE FROM A SHAPE THAT TEARS ALL FOUR SIDES.
 * `TornSurface` rags every edge of its rect, so the trick - the same one
 * `TornDivider` uses for horizontal edges - is to draw it larger than the frame
 * and let `overflow-hidden` remove the edges that are not wanted. Drawn `DEPTH`
 * wider and `DEPTH` taller on both axes and offset up and left by `DEPTH`, the
 * left, top and bottom tears all fall outside the panel and only the right one
 * survives.
 *
 * THE OFFSETS ACCOUNT FOR THE RECT'S OWN INSET. `TornSurface` insets its rect
 * by `depth / 2` so the displacement cannot clip at the viewBox bounds, which
 * means the right torn edge falls at `width - depth / 2`, not at `width`.
 * Solving for the edge landing on the panel's right edge gives a surface
 * `depth * 1.5` wider than the panel; it is drawn `BITE` narrower than that so
 * the edge, teeth and all, sits just inside the panel.
 *
 * IT MEASURES RATHER THAN STRETCHES, for the reason `TornDivider` documents:
 * `feDisplacementMap`'s scale and `feTurbulence`'s baseFrequency are in user
 * units, so a stretched viewBox smears the teeth into streaks. Passing real
 * pixels keeps the tear a constant physical size at every card width.
 */
export function TornBanner({
  figure,
  alt,
  figureClass = "object-cover object-[76%_center]",
  seamClass,
  fieldClass,
  chipClass,
  volume,
  title,
  author,
  seed,
  priority = false,
}: {
  figure: string;
  alt: string;
  /** How the picture sits in the banner. A photograph covers; a padded render is contained and scaled by its caller. */
  figureClass?: string;
  /** `text-*` - the band, since `TornSurface` paints in currentColor. */
  seamClass: string;
  /** `bg-*` - the field behind the picture. */
  fieldClass: string;
  /** The volume chip's plate and text colour. */
  chipClass: string;
  /** Omitted: no chip. */
  volume?: string;
  /** A newline starts a new line, as the frame stacks BETWEEN / WORLDS. */
  title: string;
  /** Omitted: no line. */
  author?: string;
  seed: number;
  priority?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const byline = useRef<HTMLParagraphElement>(null);
  const [box, setBox] = useState({ width: 300, height: 235 });
  const [fontsReady, setFontsReady] = useState(false);

  // The title's size: the width's step, then smaller until it clears the author line.
  // `fit.key` names what it was fitted for; anything else starts again from the width's step.
  const fitKey = `${title}|${volume ?? ""}|${author ?? ""}|${box.width}x${box.height}|${fontsReady}`;
  const [fit, setFit] = useState({ key: "", step: widthStep(title) });
  const step = fit.key === fitKey ? fit.step : widthStep(title);

  useEffect(() => {
    let live = true;
    void document.fonts?.ready.then(() => live && setFontsReady(true));
    return () => {
      live = false;
    };
  }, []);

  useLayoutEffect(() => {
    const h = heading.current;
    const r = root.current?.getBoundingClientRect();
    if (!h || !r || r.height === 0) return;
    const limit = (byline.current?.getBoundingClientRect().top ?? r.bottom - r.height * 0.05) - r.height * 0.03;
    const over = h.getBoundingClientRect().bottom > limit && step < TITLE_SIZE.length - 1;
    if (fit.key !== fitKey) setFit({ key: fitKey, step: over ? step + 1 : step });
    else if (over) setFit({ key: fitKey, step: step + 1 });
  }, [fitKey, fit.key, step]);

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
    <div ref={root} className={`@container relative h-full w-full overflow-hidden ${fieldClass}`}>
      {/* The picture, on the field, filling the banner. The band then covers its
          left part, so what reads is the art to the right of the tear. */}
      <Image
        src={figure}
        unoptimized={isRemoteImage(figure)}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 767px) 92vw, 46vw"
        className={`select-none ${figureClass}`}
      />

      {/* The band, with only its right edge torn. */}
      <div ref={panel} className={`absolute inset-y-0 left-0 overflow-hidden ${BAND_WIDTH}`}>
        {/* Offset by DEPTH on both axes - a literal class, since Tailwind scans source. */}
        <TornSurface
          width={box.width + DEPTH * 1.5 - BITE}
          height={box.height + DEPTH * 3}
          depth={DEPTH}
          seed={seed}
          className={`absolute -top-[47.4px] -left-[47.4px] ${seamClass}`}
        />
      </div>

      {/* The chip and title hang from the top - the frame puts the chip 12-16% of
          the height down on both cards, not in the vertical middle. */}
      {/* The chip and the author line scale with the banner but never below 8px -
          there is no phone frame for a torn card, and 6px is not readable.

          THE CHIP ALSO HAS A CEILING, which the author line does not need. Its
          plate is a 48 x 21 SVG stretched to the box by `bg-size-[100%_100%]`,
          and on the detail page's 1071-wide cover an uncapped 1.9cqw made the
          box three times the art's width: the turbulence that rags its edge
          smeared into blocks that read, at a glance, as letters behind the
          text. Capped at 14px the plate is never stretched much past its own
          size. The card sizes the frame draws are well under the cap, so they
          are unchanged. */}
      <div className={`absolute top-[13%] left-0 flex flex-col px-[4.4cqw] ${BAND_WIDTH}`}>
        {volume ? (
          <span
            className={`font-display inline-grid w-fit place-items-center bg-size-[100%_100%] bg-center bg-no-repeat px-[clamp(0.5rem,2.4cqw,1.1rem)] py-[clamp(0.25rem,1.3cqw,0.6rem)] text-[clamp(0.5rem,1.9cqw,0.875rem)] leading-none font-bold tracking-[0.08em] ${chipClass}`}
          >
            {volume}
          </span>
        ) : null}

        {/* Lines pitched at 0.8em, and a constant ~28px under the chip, which is
            12% of the band's fixed 215px - both measured off the frame. The size
            is whatever fits the band; see TITLE_SIZE. */}
        <h3
          ref={heading}
          className={`font-display text-menu-fg leading-[0.8] font-semibold tracking-[-0.03em] break-words uppercase ${TITLE_SIZE[step]} ${volume ? "mt-[12%]" : ""}`}
        >
          {title.split("\n").map((line, i) => (
            <span key={`${i}-${line}`} className="block">
              {line}
            </span>
          ))}
        </h3>
      </div>

      {author ? (
        <p ref={byline} className="text-menu-fg/80 font-body absolute bottom-[5%] left-[4.4cqw] z-1 text-[max(1.9cqw,0.5rem)] leading-none">
          {author}
        </p>
      ) : null}
    </div>
  );
}
