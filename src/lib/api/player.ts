import { z } from "zod";

import type { Profile, StandingStat, TournamentStanding } from "@/types/profile";

import { apiSeeds } from "./seeds";
import { authedRequest } from "./session";

/**
 * The signed-in player's own data, read and written in the browser as them
 * (\`authedRequest\`): \`/v1/player/profile\`, \`/v1/player/avatar\`, and the
 * heartbeat that counts them as active (\`/v1/player/heartbeat\`).
 *
 * What the profile frames show and the API doesn't send (FLAGGED): a main
 * champion (the standing strip's CHAMPION reads a dash), and the points to the
 * next rank in a tournament. That line used to come from
 * \`/v1/leaderboards/me\`, but that is the public board's distance, not the
 * tournament's, and it ranks by Seeds, so it was dropped (2026-11-20).
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
  // The player's referral code (spec of 2026-11-20): the same value as the username, set at sign-up.
  referral_code: z.string().nullish(),
  game_player_id: z.string().nullish(),
  avatar_url: z.string().nullish(),
  level: z.number().nullish(),
  region: z.object({ name: z.string(), slug: z.string() }).nullish(),
  game_points: z.coerce.number().default(0),
  // Seeds replaced `claimable_points` (spec of 2026-11-15); the Calabash is what's spendable.
  seeds: apiSeeds.nullish(),
  stats: z
    .object({ rank: z.number().nullish(), win_rate: z.number().nullish(), loss_rate: z.number().nullish() })
    .default({}),
  tournament_rankings: z.array(ranking).default([]),
});

/** The profile, plus what the edit form starts from. */
export type PlayerProfile = Profile & {
  firstName: string;
  lastName: string;
  username: string;
  /** What their invite links carry (`lib/utils/invite.ts`): the API's `referral_code`, else the username it equals. */
  referralCode: string;
  /** The region's slug; the edit form matches it to the region list. */
  regionSlug: string | null;
};

const count = (n: number) => new Intl.NumberFormat("en-NG").format(n);

/** Statuses the site has a page for (`statusOf` in `lib/api/tournaments.ts`); running ones list first. */
const WITH_PAGE = ["active", "registration_open", "coming_soon"];

/**
 * Every tournament the player is in, for TOURNAMENT RANKINGS: running ones
 * first, then the rest in the API's order. A cancelled one is left out, since
 * a rank in it means nothing.
 */
function standings(rankings: readonly z.output<typeof ranking>[]): TournamentStanding[] {
  const kept = rankings.filter((r) => r.tournament.status !== "cancelled");
  const running = (r: z.output<typeof ranking>) => WITH_PAGE.includes(r.tournament.status);
  return [...kept.filter(running), ...kept.filter((r) => !running(r))].map((r) => ({
    name: r.tournament.title,
    slug: r.tournament.slug,
    hasPage: running(r),
    stats: standingStats(r),
    toNextRank: null,
  }));
}

/** The strip under a tournament's name. */
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
  const p = await authedRequest("GET", "/v1/player/profile", apiProfile);
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
    seeds: p.seeds ?? { calabash: 0, legacy: 0, pending: 0 },
    playGamesId: p.game_player_id ?? null,
    standings: standings(p.tournament_rankings),
    firstName: first,
    lastName: last,
    username: p.username ?? "",
    referralCode: p.referral_code || p.username || "",
    regionSlug: p.region?.slug ?? null,
  };
}

export type ProfileChanges = { firstName: string; lastName: string; username: string; regionId: string };

/**
 * Saves the edit form. Every field is optional to the API, so a blank one is
 * left out rather than sent: clearing a box doesn't wipe the name on record.
 * `location_sharing_enabled` isn't sent: the team removed that switch
 * (2026-11-18), every active player counts on the Active Player Map.
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

/**
 * "Still here": the API counts a signed-in player as active on the
 * active-player map while these keep arriving, about once a minute
 * (`ActivityHeartbeat`).
 */
export async function sendHeartbeat(): Promise<void> {
  await authedRequest("POST", "/v1/player/heartbeat", z.unknown());
}

/**
 * Linking a Google Play Games account, which is what lets the game's Seeds
 * and points reach the player:
 *
 *   GET    /v1/player/play/connect-url  getPlayConnectUrl(): Google's consent page
 *   POST   /v1/player/play/link         linkPlayAccount(): the code Google sends back
 *   DELETE /v1/player/play/link         unlinkPlayAccount()
 *
 * Google sends the player back to the redirect address the backend gives it,
 * with `?code=` (or `?error=` when they say no). The site takes it on the
 * profile page (`PlayGamesPanel`), so that address must be the profile:
 * `https://<site>/en/profile`. FLAGGED: confirm it with the backend.
 */
export async function getPlayConnectUrl(): Promise<string> {
  return (await authedRequest("GET", "/v1/player/play/connect-url", z.object({ url: z.string().url() }))).url;
}

export async function linkPlayAccount(authCode: string): Promise<{ playGamesId: string; name: string }> {
  const linked = await authedRequest(
    "POST",
    "/v1/player/play/link",
    z.object({ game_player_id: z.string(), display_name: z.string().default("") }),
    { auth_code: authCode },
  );
  return { playGamesId: linked.game_player_id, name: linked.display_name };
}

export async function unlinkPlayAccount(): Promise<void> {
  await authedRequest("DELETE", "/v1/player/play/link", z.unknown());
}
