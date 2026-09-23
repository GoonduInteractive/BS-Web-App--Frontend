import type { TournamentRegion } from "@/types/tournament";

/**
 * Leaderboard contracts. Overview section 9 names `LeaderboardEntry` as one of
 * the shapes to define now; leaderboards launch Nigeria-first, split by state,
 * which is why a row carries a region and the board filters on it.
 */

/** A season the board can be filtered to. `all` is the frame's ALL TIME. */
export type LeaderboardSeason = "all" | 2026 | 2025;

/** Keys into `messages.competition.champions`. */
export type ChampionKey = "soma" | "kaira" | "ogbunabali";

export type LeaderboardEntry = {
  rank: number;
  player: {
    name: string;
    handle: string;
    avatar: string;
  };
  region: TournamentRegion;
  points: number;
  champion: ChampionKey;
  /** Percentage, 0-100. */
  winRate: number;
  /** The season the points were earned in. */
  season: 2026 | 2025;
};

/**
 * The top three. The frame each stands in belongs to the STEP, not the person
 * - Design's first delivery baked one portrait into each frame, and a rank
 * changes hands - so an entry carries only its step and its player, whose
 * `avatar` the podium sets inside the step's frame (see `PodiumFrame`).
 */
export type PodiumEntry = LeaderboardEntry & {
  step: "gold" | "silver" | "bronze";
};

/** The signed-in player's own row, with the distance to the rank above. */
export type JourneyEntry = LeaderboardEntry & {
  pointsToNextRank: number;
};
