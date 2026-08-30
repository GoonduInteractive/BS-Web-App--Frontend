/**
 * NsibidiField is the animated marquee of Nsibidi strips that runs behind the entry screen's
 */

type NsibidiRow = {
  /** SVG of this row's repeating unit. */
  src: string;
  /** Aspect ratio of the repeating unit, width divided by height. */
  tileAspect: number;
  /** Seconds for one full loop. Deliberately varied per row. */
  duration: number;
};

/* Rows alternate direction: odd rows left, even rows right.
 */
const ROWS: NsibidiRow[] = [
  { src: "/assets/brand/nsibidi-row-1.svg", tileAspect: 1581 / 150, duration: 72 },
  { src: "/assets/brand/nsibidi-row-2.svg", tileAspect: 1581 / 160, duration: 88 },
  { src: "/assets/brand/nsibidi-row-3.svg", tileAspect: 1584 / 147, duration: 78 },
  { src: "/assets/brand/nsibidi-row-4.svg", tileAspect: 1568 / 158, duration: 94 },
  // The same four strips again. Durations are deliberately different from their
  // twins above: identical duration *and* direction would put a row in lockstep
  // with the one four above it, which is exactly the mechanical read to avoid.
  { src: "/assets/brand/nsibidi-row-1.svg", tileAspect: 1581 / 150, duration: 66 },
  { src: "/assets/brand/nsibidi-row-2.svg", tileAspect: 1581 / 160, duration: 96 },
  { src: "/assets/brand/nsibidi-row-3.svg", tileAspect: 1584 / 147, duration: 84 },
  { src: "/assets/brand/nsibidi-row-4.svg", tileAspect: 1568 / 158, duration: 102 },
];

const TILES_PER_SET = 5;

export function NsibidiField({ rows = ROWS }: { rows?: NsibidiRow[] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex select-none flex-col overflow-hidden opacity-8"
    >
      {rows.map((row, i) => {
        const direction = i % 2 === 0 ? "left" : "right";

        return (
          <div key={`${row.src}-${i}`} className="flex-1 overflow-hidden">
            <div
              className="nsibidi-track"
              data-direction={direction}
              style={
                {

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
