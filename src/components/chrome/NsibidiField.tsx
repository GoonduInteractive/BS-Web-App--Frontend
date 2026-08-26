/**
 * NsibidiField
 * ---------------------------------------------------------------------------
 * Ambient background for the entry screen. Four horizontal rows of Nsibidi
 * symbols scrolling continuously, each row in the opposite direction to the
 * one above it. Each row has its own artwork and repeats across the full width
 * of the screen.
 *
 * Pure CSS keyframes, deliberately. The animation has no timeline, no
 * sequencing and no coordination with scroll, so there is nothing for GSAP to
 * do here that the compositor does not already do for free. See the feature
 * note in context/ for the full reasoning.
 *
 * Looping: the track holds two identical sets of tiles and animates transform
 * to exactly -50%, which lands on a repeat boundary so the seam is never
 * visible. Transform-only means compositor-only, so no repaint per frame.
 * ---------------------------------------------------------------------------
 */

type NsibidiRow = {
  /** SVG of this row's repeating unit. */
  src: string;
  /** Aspect ratio of the repeating unit, width divided by height. */
  tileAspect: number;
  /** Seconds for one full loop. Deliberately varied per row. */
  duration: number;
};

/**
 * Rows alternate direction: odd rows left, even rows right.
 *
 * tileAspect values are read from each SVG's own viewBox, not estimated:
 *   row 1  1581 x 150   row 2  1581 x 160
 *   row 3  1584 x 147   row 4  1568 x 158
 *
 * Durations are deliberately not identical. If every row takes the same time
 * the field reads mechanical, like a departures board. A few seconds of
 * variance makes it read as ambient.
 */
const ROWS: NsibidiRow[] = [
  { src: "/assets/brand/nsibidi-row-1.svg", tileAspect: 1581 / 150, duration: 72 },
  { src: "/assets/brand/nsibidi-row-2.svg", tileAspect: 1581 / 160, duration: 88 },
  { src: "/assets/brand/nsibidi-row-3.svg", tileAspect: 1584 / 147, duration: 78 },
  { src: "/assets/brand/nsibidi-row-4.svg", tileAspect: 1568 / 158, duration: 94 },
];

/**
 * Tiles per set. One set must be wider than the widest viewport it covers or
 * the loop shows an empty gap.
 *
 * The feature note assumed a 2.43 tile and called for six. These strips are
 * roughly 10:1, so a single tile is already about ten times the row height —
 * four times wider than that assumption. Three per set covers the worst
 * realistic case (3840px wide against a short 768px viewport, where the row is
 * only 192px tall) with room to spare, at half the layer count of six.
 */
const TILES_PER_SET = 3;

/**
 * PROVISIONAL. The strips are FAF9F9 at full opacity, so the wash is applied
 * here rather than baked into the files. Eyeballed against the Figma frame —
 * ask Design for the real value.
 */
export function NsibidiField({ rows = ROWS }: { rows?: NsibidiRow[] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex select-none flex-col overflow-hidden opacity-8"
    >
      {rows.map((row, i) => {
        const direction = i % 2 === 0 ? "left" : "right";

        return (
          <div key={row.src} className="flex-1 overflow-hidden">
            <div
              className="nsibidi-track"
              data-direction={direction}
              style={
                {
                  // Custom properties through `style` are the sanctioned way to
                  // pass per-instance values. These are not inline declarations.
                  "--row-anim": `nsibidi-${direction}`,
                  "--row-duration": `${row.duration}s`,
                } as React.CSSProperties
              }
            >
              {/* Two identical sets. Translating -50% moves exactly one set
                  width, a whole number of tiles, so the seam never shows. */}
              {Array.from({ length: TILES_PER_SET * 2 }, (_, t) => (
                <div
                  key={t}
                  className="nsibidi-tile"
                  style={{
                    aspectRatio: `${row.tileAspect}`,
                    backgroundImage: `url(${row.src})`,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
