import type { PlayerHotspot } from "@/types/players";

/**
 * One anonymous pin per active player in a region, AT RANDOM around the
 * region's pin: the team's decision (2026-11-17), "if there are 50 active
 * players in Enugu, randomize 50 pinpoints in Enugu". The API counts players
 * per region and never says where anyone is, and nobody is ever shown, so
 * these positions are made up on purpose; they say how busy a region is, not
 * where a person stands.
 *
 * Seeded by the region, so the same count lays out the same way on every
 * visit instead of jumping about; a normal spread, thinning out from the pin.
 */

export type ScatterPin = { id: string; lon: number; lat: number };

/** About 7km either side of the pin, at one standard deviation. */
const SPREAD = 0.06;
/** A region past this many active players still draws this many: markers are DOM nodes. */
const MAX_PINS = 300;

/** mulberry32, from a string seed. */
function random(seed: string): () => number {
  let a = 0;
  for (const ch of seed) a = (a * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A standard normal pair (Box-Muller). */
function normalPair(next: () => number): [number, number] {
  const u = Math.max(next(), 1e-9);
  const v = next();
  const r = Math.sqrt(-2 * Math.log(u));
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)];
}

export function scatterPins(spot: PlayerHotspot): readonly ScatterPin[] {
  const next = random(spot.id);
  // A degree of longitude shrinks with latitude: scaled so the cluster is round on the ground.
  const lonSpread = SPREAD / Math.cos((spot.lat * Math.PI) / 180);
  return Array.from({ length: Math.min(spot.active, MAX_PINS) }, (_, i) => {
    const [dx, dy] = normalPair(next);
    return { id: `${spot.id}-${i + 1}`, lon: spot.lon + dx * lonSpread, lat: spot.lat + dy * SPREAD };
  });
}
