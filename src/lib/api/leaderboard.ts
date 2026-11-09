import { z } from "zod";

import type { LeaderboardEntry, PodiumEntry } from "@/types/leaderboard";

import { apiGet } from "./client";
import { apiEntry, toEntry } from "./leaderboard-entry";

/**
 * The leaderboard, behind a typed contract.
 *
 * It is the game backend's public `/v1/leaderboards`, read on the server
 * at build and whenever the Competition page revalidates: the top fifty, the
 * first three on the podium. FLAGGED: the board has no paging, so a player
 * below fifty is only on it in their own YOUR JOURNEY row, which the browser
 * reads as them (`lib/api/standing.ts`). What a live row lacks, and what the
 * board does about it, is on `leaderboard-entry.ts`.
 */

/** How many rows the board shows. */
const TOP = 50;

const STEPS: Record<number, PodiumEntry["step"]> = { 1: "gold", 2: "silver", 3: "bronze" };

/* ------------------------------------------------------------------------ */
/* The contract                                                               */
/* ------------------------------------------------------------------------ */

export async function getLeaderboard(): Promise<{
  podium: readonly PodiumEntry[];
  rows: readonly LeaderboardEntry[];
}> {

  const { items } = await apiGet(`/v1/leaderboards?page=1&limit=${TOP}`, z.object({ items: z.array(apiEntry) }));
  const entries = items.map(toEntry);
  return {
    podium: entries.flatMap((e) => (STEPS[e.rank] ? [{ ...e, step: STEPS[e.rank] }] : [])),
    rows: entries.filter((e) => !STEPS[e.rank]),
  };
}

