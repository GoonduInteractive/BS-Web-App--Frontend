import type { LeaderboardEntry, LeaderboardFilter } from "@/types/leaderboard";

/**
 * Apply the board's two filters. Pure, so the client can run it on what the
 * server handed over without asking again - the whole board is a few hundred
 * bytes. The podium is filtered too: a region with no champion on it shows an
 * empty step rather than a champion from somewhere else.
 *
 * Its own module, not the adapter's: the board is a client component, and the
 * adapter reads every locale's messages.
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
