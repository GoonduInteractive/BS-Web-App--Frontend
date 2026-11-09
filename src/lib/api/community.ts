import { z } from "zod";

import { WALL_EXTENT, WALL_LAYOUT, WALL_MARGIN } from "@/lib/api/community-layout";
import { CARD_WIDTH, noteHeight } from "@/lib/community/place";
import type { CommunityNote, NoteTint, WallBounds } from "@/types/community";

import { apiGet, publicHandle } from "./client";

/**
 * The community wall.
 *
 * THE WALL IS THE REFERENCE WALL. `05-community/Frame 1984078901.png` draws the
 * whole board - 161 cards over ~7300 x 4900, touching and here and there
 * lapping by a few pixels - and `community-layout.ts` is that frame read off
 * card by card. The canvas is its extent plus a margin all round, so there is
 * wall to pan to in every direction. A fresh visitor opens on the region that
 * most resembles `Community Wall.png`'s first view.
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

/**
 * The wall is the game backend's public `/v1/notes`, read on the server
 * at build and whenever the Community page revalidates; posting and liking go
 * through `lib/api/notes.ts` in the browser.
 *
 * A NOTE HAS NO PLACE ON THE WALL in the API, so the site gives it one: the
 * reference wall's own slots, nearest the opening view first, newest note
 * nearest - so a short wall still opens on its notes - and only a slot tall
 * enough for the note. Its paper is the API's `color` where that names one of
 * the four, else the slot's.
 *
 * Who wrote it is the note's `author` (since 2026-10-27): their name, else
 * their username. WHAT A NOTE DOESN'T CARRY (FLAGGED): how many likes it has,
 * or whether this player liked it (the count starts at 0 on every visit). The
 * public list is approved notes only; a status, where one is still sent, is
 * checked anyway.
 */
const apiNote = z.object({
  id: z.string(),
  content: z.string(),
  color: z.string().nullish(),
  moderation_status: z.string().nullish(),
  created_at: z.string(),
  author: z
    .object({
      username: z.string().nullish(),
      game_player_id: z.string().nullish(),
      first_name: z.string().nullish(),
      last_name: z.string().nullish(),
    })
    .nullish(),
  likes: z.coerce.number().nullish(),
  likes_count: z.coerce.number().nullish(),
});

const TINTS: readonly NoteTint[] = ["cream", "mint", "sky", "rose"];

/** The slots, nearest the middle of the desktop's opening view first. */
const SLOTS = (() => {
  const cx = WALL.origin.x + 720;
  const cy = WALL.origin.y + 436;
  return WALL_LAYOUT.map(([tint, x, y, long]) => ({ tint, x, y, height: long ? 384 : 232 }))
    .map((slot) => ({ ...slot, d: Math.hypot(slot.x + CARD_WIDTH / 2 - cx, slot.y + slot.height / 2 - cy) }))
    .sort((a, b) => a.d - b.d);
})();

export async function getWallNotes(): Promise<readonly CommunityNote[]> {
  const notes = (await apiGet("/v1/notes", z.array(apiNote)))
    .filter((n) => !n.moderation_status || n.moderation_status === "approved")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const free = [...SLOTS];
  return notes.flatMap((n) => {
    const at = free.findIndex((slot) => slot.height >= noteHeight(n.content));
    // A wall with more notes than slots shows the newest; FLAGGED, it has 161.
    if (at < 0) return [];
    const [slot] = free.splice(at, 1);
    const name = [n.author?.first_name, n.author?.last_name].filter(Boolean).join(" ");
    return [
      {
        id: n.id,
        author: name || publicHandle(n.author?.username, n.author?.game_player_id) || "—",
        body: n.content,
        likes: n.likes_count ?? n.likes ?? 0,
        postedAt: n.created_at,
        tint: TINTS.find((t) => t === n.color) ?? slot.tint,
        x: slot.x,
        y: slot.y,
      },
    ];
  });
}

/**
 * "30 mins ago", from the ISO instant the note carries, through the copy's
 * own patterns ("{n} mins ago" is the frame's; hours and days are its
 * extension). Minutes under an hour, hours under a day, days after that.
 * Nothing for a date it can't read.
 */
export function relativeTime(
  iso: string,
  patterns: { minutes: string; hours: string; days: string },
  now: number = Date.now(),
): string {
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return "";
  const diff = Math.max(0, now - at);
  const minutes = Math.max(1, Math.round(diff / 60_000));
  if (minutes < 60) return patterns.minutes.replace("{n}", String(minutes));
  const hours = Math.round(minutes / 60);
  if (hours < 24) return patterns.hours.replace("{n}", String(hours));
  return patterns.days.replace("{n}", String(Math.round(hours / 24)));
}
