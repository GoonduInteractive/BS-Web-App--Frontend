import { getViewerState } from "@/lib/api/points";
import { getProfile } from "@/lib/api/profile";
import type {
  JourneyEntry,
  LeaderboardEntry,
  LeaderboardSeason,
  PodiumEntry,
} from "@/types/leaderboard";
import type { TournamentRegion } from "@/types/tournament";

/**
 * The leaderboard, behind a typed contract. NO BACKEND.
 *
 * THE PODIUM IS THE FRAME'S: one champion on all three steps, because the
 * delivered gold, silver and bronze frames carry the same portrait - the hall
 * of ascension's one mock champion, `somamain`. Points are the frame's 6000 /
 * 2000 / 2000. FLAGGED as the comp's data.
 *
 * THE ROWS ARE NOT THE FRAME'S. It repeats "5 · David Salem · Lagos · 18,000 ·
 * Soma · 82%" eight times with one "4" - a comp filling a table. Mocks here
 * carry plausible data, so the rows below are eight distinct players across
 * the regions the page already names, in descending points with plausible win
 * rates. Names are invented for the mock, as the team roster's were.
 *
 * YOUR JOURNEY IS THE PROFILE'S PERSON. The frame prints David Salem at rank
 * 200; the profile adapter's one mock person is Daniel Israel at #200 with
 * 12,000 points and Kaira, so the row reads from there and the site keeps one
 * account, not two. It exists only for a signed-in viewer - `getViewerState()`
 * is the same mock flag the store's points panels use.
 */
const AVATAR = "/assets/comics/soma-gate-character.png";

const PODIUM: readonly PodiumEntry[] = [
  {
    rank: 1,
    step: "gold",
    player: { name: "Somamain", handle: "@somamain", avatar: AVATAR },
    region: "lagos",
    points: 6000,
    champion: "soma",
    winRate: 91,
    season: 2026,
  },
  {
    rank: 2,
    step: "silver",
    player: { name: "Somamain", handle: "@somamain", avatar: AVATAR },
    region: "lagos",
    points: 2000,
    champion: "soma",
    winRate: 88,
    season: 2026,
  },
  {
    rank: 3,
    step: "bronze",
    player: { name: "Somamain", handle: "@somamain", avatar: AVATAR },
    region: "lagos",
    points: 2000,
    champion: "soma",
    winRate: 84,
    season: 2026,
  },
];

const ROWS: readonly LeaderboardEntry[] = [
  { rank: 4, player: { name: "Chidera Okonkwo", handle: "@chidera_okk", avatar: AVATAR }, region: "lagos", points: 18_000, champion: "soma", winRate: 82, season: 2026 },
  { rank: 5, player: { name: "Ifeoma Nwachukwu", handle: "@ify_nwa", avatar: AVATAR }, region: "southEast", points: 17_450, champion: "kaira", winRate: 79, season: 2026 },
  { rank: 6, player: { name: "Tunde Bakare", handle: "@tundeb", avatar: AVATAR }, region: "lagos", points: 16_900, champion: "ogbunabali", winRate: 77, season: 2026 },
  { rank: 7, player: { name: "Amara Eze", handle: "@amaraeze", avatar: AVATAR }, region: "abuja", points: 16_200, champion: "kaira", winRate: 75, season: 2025 },
  { rank: 8, player: { name: "Kwame Mensah", handle: "@kwame_m", avatar: AVATAR }, region: "ghana", points: 15_800, champion: "soma", winRate: 74, season: 2025 },
  { rank: 9, player: { name: "Tamuno Briggs", handle: "@tamunob", avatar: AVATAR }, region: "rivers", points: 15_100, champion: "soma", winRate: 71, season: 2026 },
  { rank: 10, player: { name: "Ngozi Okafor", handle: "@ngozi_ok", avatar: AVATAR }, region: "southEast", points: 14_600, champion: "kaira", winRate: 70, season: 2025 },
  { rank: 11, player: { name: "Bashir Adamu", handle: "@bashir_ad", avatar: AVATAR }, region: "abuja", points: 14_050, champion: "ogbunabali", winRate: 68, season: 2025 },
];

export type LeaderboardFilter = {
  region: TournamentRegion | "all";
  season: LeaderboardSeason;
};

export async function getLeaderboard(): Promise<{
  podium: readonly PodiumEntry[];
  rows: readonly LeaderboardEntry[];
}> {
  return { podium: PODIUM, rows: ROWS };
}

/**
 * Apply the board's two filters. Pure, so the client can run it on what the
 * server handed over without asking again - the whole board is a few hundred
 * bytes. The podium is filtered too: a region with no champion on it shows an
 * empty step rather than a champion from somewhere else.
 */
export function filterEntries<T extends LeaderboardEntry>(
  entries: readonly T[],
  filter: LeaderboardFilter,
): readonly T[] {
  return entries.filter(
    (entry) =>
      (filter.region === "all" || entry.region === filter.region) &&
      (filter.season === "all" || entry.season === filter.season),
  );
}

/** The viewer's own row, or null when nobody is signed in. */
export async function getJourney(): Promise<JourneyEntry | null> {
  if ((await getViewerState()) === "signed-out") return null;
  const profile = await getProfile();
  if (!profile.standing || profile.rank === undefined) return null;
  return {
    rank: 200,
    player: { name: profile.name, handle: profile.handle, avatar: profile.avatar },
    // Enugu, per the profile's location.
    region: "southEast",
    points: profile.gamePoints,
    champion: "kaira",
    winRate: profile.winRate,
    season: 2026,
    pointsToNextRank: profile.standing.toNextRank,
  };
}
