import { z } from "zod";

import type { ActiveRegion } from "@/types/region";

import { apiGet } from "./client";

/**
 * The regions with a league running, from the game backend: the list admins
 * manage in the admin's Regions page, so the site and the admin name the same
 * places (human, 2026-10-15). It replaced the Competition frame's five
 * designed rows.
 *
 * GLOBAL IS LEFT OUT. The backend keeps it as a region so a tournament can be
 * open to everyone; it is not a place, and not a league.
 *
 * The backend's order is kept (it sorts by name). Read on the server: at build,
 * and again whenever the Competition page revalidates.
 */
const apiRegion = z.object({ id: z.string(), name: z.string(), slug: z.string() });

const GLOBAL = "global";

export async function getActiveRegions(): Promise<readonly ActiveRegion[]> {
  const regions = await apiGet("/v1/regions", z.array(apiRegion));
  return regions.filter((r) => r.slug !== GLOBAL).map((r) => ({ slug: r.slug, name: r.name }));
}

/**
 * A region a player can choose: the API's id goes with the sign-up or the
 * profile edit; the slug matches it to the region a profile reports.
 */
export type SignUpRegion = { id: string; slug: string; name: string };

/**
 * The regions offered on Create Account. GLOBAL STAYS, LAST: for a player
 * outside every listed region, which is what the API offers it for. FLAGGED.
 */
export async function getSignUpRegions(): Promise<readonly SignUpRegion[]> {
  const regions = await apiGet("/v1/regions", z.array(apiRegion));
  const place = regions.filter((r) => r.slug !== GLOBAL);
  const global = regions.filter((r) => r.slug === GLOBAL);
  return [...place, ...global].map((r) => ({ id: r.id, slug: r.slug, name: r.name }));
}
