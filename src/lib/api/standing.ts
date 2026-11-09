import { z } from "zod";

import type { JourneyEntry } from "@/types/leaderboard";

import { ApiError } from "./client";
import { apiEntry, toEntry } from "./leaderboard-entry";
import { authedRequest } from "./session";

/**
 * YOUR JOURNEY: the signed-in player's own row on the leaderboard, read in the
 * browser as them (`/v1/leaderboards/me`) - the board itself is static and
 * can't know who is looking. Null for a player not ranked yet.
 */
const me = apiEntry.extend({ points_to_next_rank: z.number().nullish() });

export async function getMyStanding(): Promise<JourneyEntry | null> {
  try {
    const row = await authedRequest("GET", "/v1/leaderboards/me", me.nullable());
    return row ? { ...toEntry(row), pointsToNextRank: row.points_to_next_rank ?? null } : null;
  } catch (e) {
    // Not on the board yet is a 404 to some APIs; that is no row, not a failure.
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
