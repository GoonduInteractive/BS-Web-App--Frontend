/**
 * The player profile.
 *
 * NO ACCOUNT SYSTEM EXISTS. This is the shape a profile will have, served by a
 * mock adapter and switched by the same `getViewerState()` flag the points
 * panels use. Nothing here is authenticated, stored, or sent anywhere.
 */

/** One row of the tournament strip, in the order the frame draws them. */
export type StandingStat = {
  /** Key into `messages.profile.standing`. */
  labelKey: "rank" | "points" | "winRate" | "champion";
  value: string;
  /** The delivered Nsibidi glyph for this stat. */
  glyph: string;
};

export type TournamentStanding = {
  /** Key into `messages.profile.tournaments`. */
  nameKey: string;
  stats: readonly StandingStat[];
  /** Points to the next rank. Rendered as a sentence beneath the strip. */
  toNextRank: number;
};

export type Profile = {
  name: string;
  handle: string;
  avatar: string;
  level: number;
  winRate: number;
  loss: number;
  /** Present only once the player is placed in a tournament. */
  rank?: number;
  location: string;
  gamePoints: number;
  claimablePoints: number;
  /** Null when the player is in no tournament - the frame's first state. */
  standing: TournamentStanding | null;
};

/**
 * The delivery details a signed-in player saved last time. The checkout
 * pre-fills from it and every field stays editable, so they can order for
 * someone else. `state` and `lgaId` are `nigeria-lga-data` names and ids.
 */
export type SavedAddress = {
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  city: string;
  zip: string;
  state: string;
  lgaId: string;
};
