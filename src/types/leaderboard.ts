/**
 * Leaderboard contracts. Overview section 9 names `LeaderboardEntry` as one of
 * the shapes to define now; leaderboards launch Nigeria-first, split by state,
 * which is why a row carries a region and the board filters on it.
 *
 * Like a tournament's, a row's copy is RESOLVED: the region and the champion
 * arrive as the strings to print (`types/tournament.ts`).
 */

export type LeaderboardEntry = {
  rank: number;
  player: {
    name: string;
    handle: string;
    avatar: string;
  };
  /** Where the player plays, as printed - "Lagos" - and the region filter's value. */
  region: string;
  points: number;
  /** The champion they play, as printed; null where the source doesn't say. */
  champion: string | null;
  /** Percentage, 0-100; null before a first match. */
  winRate: number | null;
  /** The season the points were earned in; null where the source keeps no seasons. */
  season: number | null;
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

/** The signed-in player's own row, with the distance to the rank above (null at the top). */
export type JourneyEntry = LeaderboardEntry & {
  pointsToNextRank: number | null;
};

/** The board's two filters; `all` is ALL REGION and ALL TIME. */
export type LeaderboardFilter = {
  region: string | "all";
  season: number | "all";
};
