import Image from "next/image";

import { TornDivider } from "@/components/ui/TornDivider";
import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue } from "@/types/merch";

/**
 * A comic cover, assembled. Figma: the cover on `Merch Store- Comics Detail.png`
 * and the four cards on the store index.
 *
 * Frame at 1440 — 410 x 562, a band down to 43%, a torn seam, then the issue's
 * field. The chip sits 8% down, the title under it, the partner line at the
 * foot, and the render straddles the seam.
 *
 * THE TWO COVERS LAYER DIFFERENTLY, and it is not a detail. Volume 1 places a
 * cutout IN FRONT of the seam — Soma's head crosses up into the band. Volume 2's
 * render IS the field: its studio backdrop is baked into the file, so it covers
 * the field edge to edge and runs up BEHIND the seam, which is painted in the
 * band's colour over it. `figureMode` carries that difference.
 *
 * THE TYPE IS SIZED IN `cqw`, NOT PERCENT. A percentage font-size resolves
 * against the PARENT'S font-size, not against the element's box, so it would
 * have left the title at a fixed share of 16px on both the 410 cover and the 300
 * card. Container query units are the ones that measure the container, which is
 * what `@container` here is for and the only reason it is on this element.
 *
 * Every class arrives from the manifest as a WHOLE literal. Deriving the seam's
 * colour with `field.replace("bg-", "text-")` produced a class Tailwind had
 * never generated — it scans source text — so the seam fell back to
 * `currentColor`, inherited near-white and drew two white blobs across the
 * cover. Same trap `team.ts` documents for `w-[${n}%]`.
 */
/**
 * The title's size is set PER CONTEXT because the frames set it per context.
 * Measured cap heights over Teko's 0.6366 ratio, against each cover's own width:
 *
 *   cover  75px in a 414 box  = 18.2cqw   the featured cover and the detail page
 *   card   35px in a 238 box  = 14.5cqw   the comics EXPLORE grid
 *   mini   36px in a 304 box  = 11.8cqw   the merch grids and related rows
 *
 * A single `cqw` value cannot serve all three, which is the whole reason this is
 * a prop rather than one number.
 */
const TITLE: Record<CoverSize, string> = {
  cover: "text-[18.2cqw] leading-[0.72]",
  card: "text-[14.5cqw] leading-[0.82]",
  mini: "text-[11.8cqw] leading-[0.9]",
};

export type CoverSize = "cover" | "card" | "mini";

export function ComicCover({
  issue,
  messages,
  priority = false,
  size = "mini",
}: {
  issue: ComicIssue;
  messages: Messages;
  priority?: boolean;
  size?: CoverSize;
}) {
  const t = messages.merch.comics;
  const copy = t.issues[issue.copyKey as keyof typeof t.issues];
  const { cover } = issue;
  const centred = cover.align === "center";

  return (
    <div className={`@container relative aspect-[410/562] w-full overflow-hidden ${cover.band}`}>
      {/* The field below the seam. Flat on volume 1; on volume 2 the render
          covers it, and this is only what shows if the image has not loaded. */}
      <div className={`absolute inset-x-0 bottom-0 h-[57.3%] ${cover.field}`} />

      {cover.figureMode === "field" ? (
        <div className="absolute inset-x-0 bottom-0 h-[57.3%] overflow-hidden">
          {/* CONTAIN, NOT COVER. The render is 297 x 321 against a field nearer
              410 x 320, so cover scales it 38% and takes the feet off. The file
              carries its own dark backdrop, which sits close enough to the field
              token that the letterbox does not read as one. */}
          <Image
            src={cover.figure}
            alt={copy.coverAlt}
            fill
            priority={priority}
            sizes="(max-width: 767px) 90vw, 30vw"
            className="object-contain object-bottom select-none"
          />
        </div>
      ) : null}

      {/* THE SEAM IS THE BAND'S BOTTOM EDGE, TORN, BITING DOWN INTO THE FIELD —
          on both covers. It was drawn the other way round (the field's colour
          biting up) until the frame was profiled: scanning down every fourth
          column for the first field-coloured pixel gives a median of 247 with a
          242..253 interquartile range, so the field's top edge is flat at ~242
          and everything below it is the band's teeth. Tearing upward put red
          above 242 and pulled the whole seam 37px high. */}
      <TornDivider
        edge="bottom"
        seed={issue.volume * 1471}
        className={`${cover.seam} absolute inset-x-0 top-[42.7%] z-1 -translate-y-[55%]`}
      />

      {cover.figureMode === "figure" ? (
        <>
          {/* The faint glyph column down the left of the field, as the frame
              draws it. Decorative, so it carries no alt. */}
          <Image
            src="/assets/ornaments/nsibidi-glyphs-1.svg"
            alt=""
            aria-hidden
            width={77}
            height={359}
            className="absolute top-[49%] left-[10.9%] z-2 w-[10.9%] opacity-55 select-none"
          />

          {cover.prop ? (
            <Image
              src={cover.prop}
              alt=""
              aria-hidden
              width={1156}
              height={1688}
              sizes="(max-width: 767px) 90vw, 30vw"
              className={`absolute z-2 max-w-none select-none ${cover.propClass}`}
            />
          ) : null}

          <Image
            src={cover.figure}
            alt={copy.coverAlt}
            width={1200}
            height={1200}
            priority={priority}
            sizes="(max-width: 767px) 90vw, 30vw"
            className={`absolute z-3 max-w-none select-none ${cover.figureClass}`}
          />
        </>
      ) : null}

      <div
        // A PERCENTAGE PADDING RESOLVES AGAINST THE CONTAINER'S WIDTH, on both
        // axes — so the frame's 44px top inset on a 414 x 567 cover is 10.7% of
        // the width, not 7.8% of the height. Written as 7.8 it put the chip 11px
        // high on every cover.
        className={`relative z-4 px-[9.9%] pt-[10.7%] ${centred ? "text-center" : ""}`}
      >
        {/* The chip is the delivered torn plate, stretched to the label rather
            than letterboxed — the artwork carries no preserveAspectRatio. */}
        <span
          className={`font-display inline-grid place-items-center bg-size-[100%_100%] bg-center bg-no-repeat px-[4.5cqw] py-[1.9cqw] text-[2.7cqw] leading-none font-bold tracking-[0.08em] ${cover.chip}`}
        >
          {copy.volume}
        </span>

        {/* The break is in the copy, not here: "TRIAL OF / THE GODS" is a
            decision about those four English words and Igbo will not break in
            the same place. */}
        <h3
          className={`font-display text-menu-fg mt-[2.4cqw] font-semibold tracking-[-0.03em] uppercase ${TITLE[size]}`}
        >
          {copy.coverTitle.split("\n").map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
      </div>

      <p
        className={`text-menu-fg/80 font-body absolute bottom-[4%] z-4 text-[2.7cqw] leading-none ${
          centred ? "inset-x-0 text-center" : "left-[9.9%]"
        }`}
      >
        {t.partner}
      </p>
    </div>
  );
}
