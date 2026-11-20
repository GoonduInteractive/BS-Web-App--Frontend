import { z } from "zod";

import type { ActivePlayers, PlayerHotspot } from "@/types/players";

import { apiGet } from "./client";

/**
 * The Active Player Map: `GET /v1/regions/active`, one row per region with
 * the pin an admin set for it (`map_lat`, `map_lng`, the admin's Regions
 * page) and how many of its players are active now. Active is the API's:
 * signed-in players with the site open (`ActivityHeartbeat`) and players in
 * the game (the game's own presence feed). EVERY active player counts: the
 * team removed the opt-in switch (2026-11-18), so the spec's
 * `location_sharing_enabled` isn't used. FLAGGED: the backend should count
 * everyone regardless of it.
 *
 * Read on the server, as the Community page is built and every five minutes
 * after (its `revalidate`). The spec marks the route as needing a sign-in;
 * the live API answers without one (2026-11-16), which a public map needs.
 *
 * A REGION IS ONE PIN, WITH ITS COUNT: the API counts players per region and
 * says nothing of where each one is. Zoomed in, the map scatters that many
 * anonymous pins around it (`map-scatter.ts`). A region without a pin isn't
 * drawn but still counts in the total; Global is "every region", not a place,
 * and is never drawn.
 */

const apiRegion = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  map_lat: z.coerce.number().nullish(),
  map_lng: z.coerce.number().nullish(),
  active_players: z.coerce.number().default(0),
});

/** The regions are Nigeria's, as everywhere on the site that names one. */
const COUNTRY = "Nigeria";

export async function getActivePlayers(): Promise<ActivePlayers> {
  let regions: z.output<typeof apiRegion>[];
  try {
    regions = await apiGet("/v1/regions/active", z.array(apiRegion));
  } catch {
    // No data is not "nobody": the readout shows a dash rather than a 0 the API never said.
    return { hotspots: [], active: null, regions: [] };
  }

  const hotspots: PlayerHotspot[] = regions
    .filter((r) => r.slug !== "global" && r.map_lat != null && r.map_lng != null)
    .map((r) => ({ id: r.id, slug: r.slug, city: r.name, country: COUNTRY, lat: r.map_lat!, lon: r.map_lng!, active: r.active_players }))
    .sort((a, b) => b.active - a.active || a.city.localeCompare(b.city));

  return {
    hotspots,
    active: regions.reduce((sum, r) => sum + r.active_players, 0),
    regions: regions.filter((r) => r.slug !== "global").map((r) => ({ slug: r.slug, name: r.name, active: r.active_players })),
  };
}
