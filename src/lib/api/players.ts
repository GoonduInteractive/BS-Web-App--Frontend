import type { PlayerHotspot, PlayerPin } from "@/types/players";

/**
 * Mock adapter for the Active Player Map. Swap `getHotspots` for the real call
 * when the game team delivers a schema; the shape stays.
 *
 * The frame (`Active player map.png`) reads LAGOS, NIGERIA / 120 ACTIVE
 * PLAYERS and pins West Africa. Those two numbers are the frame's; the rest of
 * the list is plausible mock data — real cities at their real coordinates,
 * Nigeria-first as the game is, with a few abroad so the map has somewhere to
 * travel to. FLAGGED as mock throughout.
 *
 * EVERY ACTIVE PLAYER HAS A PLACE. Per the human: zoomed into Nairobi the map
 * said 15 players and showed one pin — "it should show pins of the 15 players
 * in their different locations in Nairobi". So each city carries as many
 * player positions as its count, scattered around its centre with a seeded
 * normal spread sized to the city (a metropolis spreads wider than a town),
 * so the scatter is the same on every build and every visit. Real positions
 * replace them when the backend lands; until then some will land on water —
 * Lagos's lagoon, Sydney's harbour — which is the mock showing. FLAGGED.
 */
type Seed = { id: string; city: string; country: string; lon: number; lat: number; active: number; spread: number };

const SEEDS: readonly Seed[] = [
  { id: "lagos", city: "Lagos", country: "Nigeria", lon: 3.3792, lat: 6.5244, active: 120, spread: 0.08 },
  { id: "abuja", city: "Abuja", country: "Nigeria", lon: 7.4951, lat: 9.0579, active: 64, spread: 0.05 },
  { id: "port-harcourt", city: "Port Harcourt", country: "Nigeria", lon: 7.0134, lat: 4.8156, active: 37, spread: 0.04 },
  { id: "enugu", city: "Enugu", country: "Nigeria", lon: 7.5139, lat: 6.4584, active: 22, spread: 0.03 },
  { id: "ibadan", city: "Ibadan", country: "Nigeria", lon: 3.947, lat: 7.3775, active: 19, spread: 0.05 },
  { id: "accra", city: "Accra", country: "Ghana", lon: -0.187, lat: 5.6037, active: 41, spread: 0.05 },
  { id: "nairobi", city: "Nairobi", country: "Kenya", lon: 36.8219, lat: -1.2921, active: 15, spread: 0.035 },
  { id: "johannesburg", city: "Johannesburg", country: "South Africa", lon: 28.0473, lat: -26.2041, active: 11, spread: 0.08 },
  { id: "london", city: "London", country: "United Kingdom", lon: -0.1276, lat: 51.5072, active: 18, spread: 0.1 },
  { id: "berlin", city: "Berlin", country: "Germany", lon: 13.405, lat: 52.52, active: 7, spread: 0.07 },
  { id: "new-york", city: "New York", country: "United States", lon: -74.006, lat: 40.7128, active: 12, spread: 0.07 },
  { id: "toronto", city: "Toronto", country: "Canada", lon: -79.3832, lat: 43.6532, active: 9, spread: 0.08 },
  { id: "sao-paulo", city: "São Paulo", country: "Brazil", lon: -46.6333, lat: -23.5505, active: 6, spread: 0.09 },
  { id: "mumbai", city: "Mumbai", country: "India", lon: 72.8777, lat: 19.076, active: 8, spread: 0.06 },
  { id: "sydney", city: "Sydney", country: "Australia", lon: 151.2093, lat: -33.8688, active: 5, spread: 0.1 },
];

/** A small seeded generator (mulberry32), so the scatter is stable. */
function random(seed: string) {
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

/** A standard normal pair (Box–Muller) — a city thins out from its centre. */
function normalPair(next: () => number): [number, number] {
  const u = Math.max(next(), 1e-9);
  const v = next();
  const r = Math.sqrt(-2 * Math.log(u));
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)];
}

function scatter(seed: Seed): readonly PlayerPin[] {
  const next = random(seed.id);
  // Degrees of longitude shrink with latitude; scale the north–south spread
  // so the cluster is round on the ground, not on the graticule.
  const ns = seed.spread * Math.cos((seed.lat * Math.PI) / 180);
  return Array.from({ length: seed.active }, (_, i) => {
    const [dx, dy] = normalPair(next);
    return { id: `${seed.id}-${i + 1}`, lon: seed.lon + dx * seed.spread, lat: seed.lat + dy * ns };
  });
}

const HOTSPOTS: readonly PlayerHotspot[] = SEEDS.map(({ id, city, country, lon, lat, active, spread }) => ({
  id,
  city,
  country,
  lon,
  lat,
  active,
  players: scatter({ id, city, country, lon, lat, active, spread }),
}));

export async function getHotspots(): Promise<readonly PlayerHotspot[]> {
  return HOTSPOTS;
}

/**
 * The viewer's invite link, for the INVITE FRIENDS block the phone frame draws
 * under the map. The frame's own URL, transcribed. There is no account to mint
 * a real code against, so every visitor sees the same one — FLAGGED, like the
 * profile it would belong to.
 */
export async function getInviteLink(): Promise<string> {
  return "https://beyondservice.com/invite/3245gt7";
}
