import { GATES, type GateId } from "@/lib/gates";

/**
 * Which bed plays where.
 *
 * THE SOUND FOLLOWS THE GROUND YOU ARE STANDING ON, per the human
 * (2026-09-22) and per Thorgal, our reference: each gate's environment has its
 * own bed, the gate's own page keeps that same bed, and everything that is not
 * a gate - About, News, the comics, the merch store, the 404 - shares one
 * default. So walking Ọnụ Ụzọ 2's door and then opening The Characters is one
 * continuous sound, and only leaving the gate changes it.
 *
 * ⚠ THE FILES ARE PLACEHOLDERS, synthesised by `npm run audio` (see
 * `scripts/audio/make-placeholders.mjs`) because no sound design has been
 * delivered. Each one is built to match what its plate shows - the grove's
 * leaves and birds, the shrine's chimes, the canyon's wind and far water, the
 * arena's drums - but they are stand-ins and must be replaced before launch.
 * Dropping real files at these five paths is the whole of the swap.
 */
export type TrackId = GateId | "default";

export const TRACKS: Readonly<Record<TrackId, string>> = {
  theGame: "/audio/gate-1-grove.mp3",
  characters: "/audio/gate-2-shrine.mp3",
  community: "/audio/gate-3-canyon.mp3",
  competition: "/audio/gate-4-arena.mp3",
  default: "/audio/default.mp3",
};

/**
 * A bed, not a track: loud enough to be there, quiet enough to read over.
 * The fade is what a change of ground sounds like rather than a cut.
 */
export const AMBIENCE_VOLUME = 0.32;
export const FADE_MS = 700;

/**
 * The bed for where the visitor is.
 *
 * `shown` is the door the portal is standing at (`GateEntry`), which is state
 * rather than URL - four doors share `/en` - so the portal needs it to know
 * which gate is on screen. Off the portal the path decides: `/en/characters`
 * and everything under it is gate 2's, `/en/news` is nobody's.
 */
export function trackFor(pathname: string, shown: GateId | null): TrackId {
  const [, ...rest] = pathname.split("/").filter(Boolean);
  const segment = rest[0];

  // The portal: the entry screen has no ground yet, so it takes the default.
  if (!segment) return shown ?? "default";

  const gate = GATES.find((g) => g.slug === segment);
  return gate ? gate.id : "default";
}
