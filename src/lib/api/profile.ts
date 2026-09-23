import type { Profile } from "@/types/profile";

/**
 * The player profile, from a mock adapter.
 *
 * ⚠ THERE IS NO ACCOUNT SYSTEM, AND THIS IS NOT ONE. `CLAUDE.md` forbids a
 * backend, auth and sessions. The frames draw a signed-in player, so the shape
 * is built and served from here, switched by the same `getViewerState()` flag
 * the points panels already use. Nothing is authenticated. Nothing a visitor
 * types is stored. `Log Out` ends no session because there is none.
 *
 * The two profile frames are one profile in two states: `standing` is null in
 * the first and populated in the second, which is also what puts `RANK` into
 * the stats row. No boolean flag - the data says it.
 *
 * FLAGGED: the name, handle and location are the frame's own mock values.
 */
const PROFILE: Profile = {
  // Stored in sentence case: the profile card uppercases it in CSS, and the
  // header dropdown shows it as written. Casing is presentation, not data -
  // the two frames differ on it for exactly that reason.
  name: "Daniel Israel",
  handle: "@somamain",
  // The frame's avatar is Soma's render, circle-cropped.
  avatar: "/assets/comics/soma-gate-character.png",
  level: 19,
  winRate: 80,
  loss: 20,
  rank: 2,
  location: "Enugu, Nigeria",
  gamePoints: 11000,
  claimablePoints: 5000,
  standing: {
    nameKey: "wrathOfNze",
    stats: [
      { labelKey: "rank", value: "#200", glyph: "/assets/player-profile/nsibidi-rank.svg" },
      { labelKey: "points", value: "12,000", glyph: "/assets/player-profile/nsibidi-points.svg" },
      { labelKey: "winRate", value: "50%", glyph: "/assets/player-profile/nsibidi-win.svg" },
      { labelKey: "champion", value: "KAIRA", glyph: "/assets/player-profile/nsibidi-champion.svg" },
    ],
    toNextRank: 500,
  },
};

/**
 * The profile. Pass `withStanding: false` for the frame's first state - a player
 * registered in no tournament.
 */
export async function getProfile(withStanding = true): Promise<Profile> {
  if (withStanding) return PROFILE;
  return { ...PROFILE, rank: undefined, standing: null };
}
