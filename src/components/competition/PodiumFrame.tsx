import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import type { PodiumEntry } from "@/types/leaderboard";

/**
 * A podium step's frame with the player's own face in it.
 *
 * Design's first delivery (`competition/gold.png` …) had one portrait baked into
 * each frame; the human's correction (2026-09-16): "a user's rank can change,
 * hence it makes sense that the frame is independent." The frames now arrive
 * empty — `gold-frame.svg` (222 x 238), `sliver-frame.svg` [sic, the delivered
 * name] and `Bronze-frame.svg` (181 x 194) — and the ring in each is a stroked
 * ellipse with nothing inside, so the avatar goes UNDER the frame, cut to the
 * ring's inner edge, and the frame draws over its rim.
 *
 * The ring's geometry is read off each file: gold cx 103.808 cy 128.339
 * r 82.927 stroke 3.949; silver and bronze cx 84.505 cy 104.475 r 67.507 stroke
 * 3.215 (the same drawing at 0.815). Expressed as percentages of the frame's
 * box, so the face stays in the ring at any size the podium draws it. The
 * portrait is cropped like the table's avatars — cover, from the top.
 */
const FRAME = {
  gold: { src: "/assets/competition/gold-frame.svg", width: 222, height: 238, cx: 103.808, cy: 128.339, r: 82.927 - 3.949 / 2 },
  silver: { src: "/assets/competition/sliver-frame.svg", width: 181, height: 194, cx: 84.505, cy: 104.475, r: 67.507 - 3.215 / 2 },
  bronze: { src: "/assets/competition/Bronze-frame.svg", width: 181, height: 194, cx: 84.505, cy: 104.475, r: 67.507 - 3.215 / 2 },
} as const;

export function PodiumFrame({
  entry,
  alt,
  sizes,
  className,
}: {
  entry: PodiumEntry;
  /** Names the player and the rank; the frame itself is decorative. */
  alt: string;
  /** The rendered width, for the avatar's srcset. */
  sizes: string;
  className?: string;
}) {
  const f = FRAME[entry.step];
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

  return (
    <div className={cn("relative", className)} style={{ aspectRatio: `${f.width} / ${f.height}` }}>
      {/* The face, under the ring. Geometry is the asset's, so inline — the one
          place the standard allows a hand-written style is exactly this kind
          of measured placement. */}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{ left: pct(f.cx - f.r, f.width), top: pct(f.cy - f.r, f.height), width: pct(f.r * 2, f.width), height: pct(f.r * 2, f.height) }}
      >
        <Image src={entry.player.avatar} alt={alt} fill sizes={sizes} className="object-cover object-top select-none" />
      </div>
      <Image src={f.src} alt="" aria-hidden width={f.width} height={f.height} className="relative h-auto w-full select-none" />
    </div>
  );
}
