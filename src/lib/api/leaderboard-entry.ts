import { z } from "zod";

import type { LeaderboardEntry } from "@/types/leaderboard";

import { publicHandle } from "./client";

/**
 * The game backend's leaderboard rows (`/v1/leaderboards` and `/me`), and how
 * one becomes the board's. Shared by the server's board and the browser's
 * YOUR JOURNEY, so it reads no messages.
 *
 * WHAT A ROW DOESN'T CARRY (FLAGGED): a display name (the board prints the
 * handle in both lines), the champion the player plays (a dash), a season (the
 * season filter goes). The avatar is the player's own (`avatar_url`, since
 * 2026-10-27), else the default portrait.
 */

export const DEFAULT_AVATAR = "/assets/comics/soma-gate-character.png";

export const apiEntry = z.object({
  rank: z.number(),
  player: z.object({
    username: z.string().nullish(),
    game_player_id: z.string().nullish(),
    avatar_url: z.string().nullish(),
    // Before 2026-10-27 the API sent a storage key; read only if it is a full URL.
    avatar_key: z.string().nullish(),
    region: z.string().nullish(),
  }),
  points: z.coerce.number(),
  win_rate: z.number().nullish(),
});

export function toEntry(e: z.output<typeof apiEntry>): LeaderboardEntry {
  const handle = publicHandle(e.player.username, e.player.game_player_id);
  const avatar = e.player.avatar_url || e.player.avatar_key;
  return {
    rank: e.rank,
    player: {
      name: handle ?? "—",
      handle: handle ? `@${handle}` : "",
      avatar: avatar && /^https?:\/\//.test(avatar) ? avatar : DEFAULT_AVATAR,
    },
    region: e.player.region ?? "",
    points: e.points,
    champion: null,
    winRate: e.win_rate ?? null,
    season: null,
  };
}
