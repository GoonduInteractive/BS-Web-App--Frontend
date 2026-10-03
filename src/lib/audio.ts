import { GATES, type GateId } from "@/lib/gates";

/**
 * What plays where.
 *
 * TWO LAYERS, NOT ONE TRACK PER PLACE, per the human (2026-10-02): one
 * background bed runs under the whole site and never changes, and each of the
 * four gates adds its own track ON TOP of it while the visitor is in that gate.
 * The two are composed to be heard together - bed plus gate stem is that gate's
 * music - so the bed is never swapped out, only joined. Everywhere that is not
 * a gate - About, News, the comics, the merch store, the 404 - hears the bed
 * alone.
 *
 * These are the delivered tracks (BS_Web_Tracks_*), renamed to plain paths.
 */
export const BED = "/audio/bgs.mp3";

export const LAYERS: Readonly<Record<GateId, string>> = {
  theGame: "/audio/gate-1.mp3",
  characters: "/audio/gate-2.mp3",
  community: "/audio/gate-3.mp3",
  competition: "/audio/gate-4.mp3",
};

/**
 * Loud enough to be there, quiet enough to read over. Bed and gate stem share
 * one level so the blend the composer mixed is the blend that plays.
 * The fade is what entering or leaving a gate sounds like rather than a cut.
 */
export const VOLUME = 0.32;
export const FADE_MS = 700;

/**
 * The gate whose track plays over the bed, or `null` for the bed alone.
 *
 * `shown` is the door the portal is standing at (`GateEntry`), which is state
 * rather than URL - four doors share `/en` - so the portal needs it to know
 * which gate is on screen. Off the portal the path decides: `/en/characters`
 * and everything under it is gate 2's, `/en/news` is nobody's.
 */
export function layerFor(pathname: string, shown: GateId | null): GateId | null {
  const [, ...rest] = pathname.split("/").filter(Boolean);
  const segment = rest[0];

  // The portal: the entry screen has no gate yet, so it is the bed alone.
  if (!segment) return shown;

  return GATES.find((g) => g.slug === segment)?.id ?? null;
}
