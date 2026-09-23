import { WALL_EXTENT, WALL_LAYOUT, WALL_MARGIN } from "@/lib/api/community-layout";
import type { CommunityNote, WallBounds } from "@/types/community";

/**
 * Mock adapter for the community wall. Swap the body of `getWallNotes` for the
 * real call when the game team delivers a schema; the shape stays.
 *
 * THE WALL IS THE REFERENCE WALL. `05-community/Frame 1984078901.png` draws the
 * whole board - 161 cards over ~7300 x 4900, touching and here and there
 * lapping by a few pixels - and `community-layout.ts` is that frame read off
 * card by card. The canvas is its extent plus a margin all round, so there is
 * wall to pan to in every direction. A fresh visitor opens on the region that
 * most resembles `Community Wall.png`'s first view.
 *
 * THE COPY IS THE FRAME'S, TWICE OVER. The comp writes two notes - a short one
 * and a long one - and repeats them, all by "Gamenerd 32". Both are kept
 * verbatim (they are the only community copy that exists); the authors cycle
 * through the leaderboard's own handles so the wall does not read as one
 * person, and the like counts and times are spread. FLAGGED as mock data.
 */
export const WALL: WallBounds = {
  width: WALL_EXTENT.width,
  height: WALL_EXTENT.height,
  origin: { x: 1120 + WALL_MARGIN, y: WALL_MARGIN },
  // The phone frame's cards are 258 wide against the desktop's 416: the same
  // cards at 0.62. It opens on the left of the desktop's first view.
  narrowScale: 0.62,
  narrowOrigin: { x: Math.round((1120 + WALL_MARGIN) * 0.62), y: Math.round(WALL_MARGIN * 0.62) },
};

const SHORT =
  "Game play is exciting, but I love the comics more. Really glad to be part of this community.";
const LONG =
  "The gameplay is thrilling and keeps me hooked for hours, but what I truly adore are the comics—they add so much depth and fun to the experience. I'm genuinely happy to be part of such a vibrant and welcoming community. Everyone here is passionate and supportive, making it an amazing place to share and enjoy our favorite stories together.";

const AUTHORS = [
  "Gamenerd 32",
  "chihunter",
  "kairaking",
  "spiritwolf",
  "ironmask",
  "nzeforce",
  "ashwalker",
  "sunspear",
  "bashir_ad",
  "tundeb",
  "ngozi_ok",
  "amaraeze",
  "kwame_m",
  "ify_nwa",
] as const;

/** Minutes before the build, as an ISO instant - "30 mins ago" at build time. */
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const NOTES: readonly CommunityNote[] = WALL_LAYOUT.map(([tint, x, y, long], i) => ({
  id: `note-${i + 1}`,
  author: AUTHORS[(i * 5) % AUTHORS.length],
  body: long ? LONG : SHORT,
  // Spread deterministically: no two neighbours read the same.
  likes: [300, 128, 412, 56, 91, 233, 74, 189, 145, 267, 38, 302, 64, 177][(i * 3) % 14],
  postedAt: ago(30 + ((i * 37) % 1400)),
  tint,
  x,
  y,
}));

export async function getWallNotes(): Promise<readonly CommunityNote[]> {
  return NOTES;
}

/**
 * "30 mins ago", from the ISO instant the note carries, through the copy's
 * own patterns ("{n} mins ago" is the frame's; hours and days are its
 * extension). Minutes under an hour, hours under a day, days after that.
 */
export function relativeTime(
  iso: string,
  patterns: { minutes: string; hours: string; days: string },
  now: number = Date.now(),
): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.max(1, Math.round(diff / 60_000));
  if (minutes < 60) return patterns.minutes.replace("{n}", String(minutes));
  const hours = Math.round(minutes / 60);
  if (hours < 24) return patterns.hours.replace("{n}", String(hours));
  return patterns.days.replace("{n}", String(Math.round(hours / 24)));
}
