/**
 * The Active Player Map, from `GET /v1/regions/active` (`src/lib/api/players.ts`).
 * The API counts players per region, not where each one is, so a region is
 * one pin.
 */

/** A region with a pin on the map, and how many of its players are active now. */
export type PlayerHotspot = {
  id: string;
  /** The region's slug: what an invite link names it by (`lib/utils/invite.ts`). */
  slug: string;
  /** The region's name, e.g. "Lagos". */
  city: string;
  country: string;
  /** Decimal degrees, east and north positive: the pin an admin set for the region. */
  lon: number;
  lat: number;
  active: number;
};

/** The map's data: the pinned regions, busiest first, and the active count across every region. */
export type ActivePlayers = {
  hotspots: readonly PlayerHotspot[];
  /** Everyone active, pinned region or not; null when the API couldn't be read. */
  active: number | null;
  /** Every region's active count, pinned or not (not Global): what the invite nudge reads. */
  regions: readonly { slug: string; name: string; active: number }[];
};
