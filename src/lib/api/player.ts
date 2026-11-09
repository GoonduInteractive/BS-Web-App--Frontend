import { z } from "zod";

import type { Profile, StandingStat } from "@/types/profile";

import { authedRequest } from "./session";

/**
 * The signed-in player's own data, read and written in the browser as them
 * (\`authedRequest\`): \`/v1/player/profile\`, \`/v1/player/avatar\`, and their row
 * on the leaderboard (\`/v1/leaderboards/me\`) for the points to the next rank.
 *
 * What the profile frames show and the API doesn't send: a main champion (the
 * standing strip's CHAMPION reads a dash) and, for a player in no tournament,
 * anything for the strip at all (the frame's empty state). FLAGGED.
 */

/** The avatar the profile frames draw, Soma's render, until the player sets their own. */
const DEFAULT_AVATAR = "/assets/comics/soma-gate-character.png";

const ranking = z.object({
  rank: z.number().nullish(),
  tournament: z.object({ id: z.string(), title: z.string(), slug: z.string(), status: z.string() }),
  points: z.coerce.number(),
  win_rate: z.number().nullish(),
  champion: z.boolean().optional(),
});

const apiProfile = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  username: z.string().nullish(),
  game_player_id: z.string().nullish(),
  avatar_url: z.string().nullish(),
  level: z.number().nullish(),
  region: z.object({ name: z.string(), slug: z.string() }).nullish(),
  game_points: z.coerce.number().default(0),
  claimable_points: z.coerce.number().default(0),
  stats: z
    .object({ rank: z.number().nullish(), win_rate: z.number().nullish(), loss_rate: z.number().nullish() })
    .default({}),
  tournament_rankings: z.array(ranking).default([]),
});

const leaderboardMe = z.object({ points_to_next_rank: z.number().nullish() }).nullish();

/** The profile, plus what the edit form starts from. */
export type PlayerProfile = Profile & {
  firstName: string;
  lastName: string;
  username: string;
  /** The region's slug; the edit form matches it to the region list. */
  regionSlug: string | null;
};

const count = (n: number) => new Intl.NumberFormat("en-NG").format(n);

/** The strip under STANDING, for the tournament the player is in now (or was in last). */
function standingStats(r: z.output<typeof ranking>): StandingStat[] {
  return [
    { labelKey: "rank", value: r.rank != null ? `#${r.rank}` : "—", glyph: "/assets/player-profile/nsibidi-rank.svg" },
    { labelKey: "points", value: count(r.points), glyph: "/assets/player-profile/nsibidi-points.svg" },
    { labelKey: "winRate", value: r.win_rate != null ? `${Math.round(r.win_rate)}%` : "—", glyph: "/assets/player-profile/nsibidi-win.svg" },
    // The frame prints the player's main champion; the API doesn't say who that is.
    { labelKey: "champion", value: "—", glyph: "/assets/player-profile/nsibidi-champion.svg" },
  ];
}

export async function getMyProfile(): Promise<PlayerProfile> {
  const [p, me] = await Promise.all([
    authedRequest("GET", "/v1/player/profile", apiProfile),
    // Not ranked yet answers an error; that only means no "points to next rank".
    authedRequest("GET", "/v1/leaderboards/me", leaderboardMe).catch(() => null),
  ]);
  const live = (s: string) => s === "active" || s === "registration_open";
  const current = p.tournament_rankings.find((r) => live(r.tournament.status)) ?? p.tournament_rankings[0];
  const first = p.first_name ?? "";
  const last = p.last_name ?? "";

  return {
    name: `${first} ${last}`.trim() || p.username || p.email,
    handle: `@${p.username || p.game_player_id || p.email.split("@")[0]}`,
    avatar: p.avatar_url || DEFAULT_AVATAR,
    level: p.level ?? null,
    winRate: p.stats.win_rate ?? null,
    loss: p.stats.loss_rate ?? null,
    ...(p.stats.rank != null && { rank: p.stats.rank }),
    location: !p.region ? "" : p.region.slug === "global" ? p.region.name : `${p.region.name}, Nigeria`,
    gamePoints: p.game_points,
    claimablePoints: p.claimable_points,
    standing: current
      ? { name: current.tournament.title, stats: standingStats(current), toNextRank: me?.points_to_next_rank ?? null }
      : null,
    firstName: first,
    lastName: last,
    username: p.username ?? "",
    regionSlug: p.region?.slug ?? null,
  };
}

export type ProfileChanges = { firstName: string; lastName: string; username: string; regionId: string };

/**
 * Saves the edit form. Every field is optional to the API, so a blank one is
 * left out rather than sent: clearing a box doesn't wipe the name on record.
 */
export async function updateMyProfile(changes: ProfileChanges): Promise<void> {
  const firstName = changes.firstName.trim();
  const lastName = changes.lastName.trim();
  // The API takes the handle without its @.
  const username = changes.username.trim().replace(/^@/, "");
  await authedRequest("PUT", "/v1/player/profile", z.unknown(), {
    ...(firstName && { first_name: firstName }),
    ...(lastName && { last_name: lastName }),
    ...(username && { username }),
    ...(changes.regionId && { region_id: changes.regionId }),
  });
}

const uploaded = z.object({ url: z.string() });

/**
 * Uploads the picture to the API's public storage (`/v1/files/upload`), then
 * makes it the avatar. Returns its address.
 */
export async function uploadMyAvatar(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const { url } = await authedRequest("POST", "/v1/files/upload", uploaded, body);
  await authedRequest("POST", "/v1/player/avatar", z.unknown(), { avatar_url: url });
  return url;
}
