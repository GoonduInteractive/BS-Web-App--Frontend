/**
 * The player profile: the signed-in player's, from `GET /v1/player/profile`
 * (`lib/api/player.ts`).
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
  /** The tournament's name, as the API gives it. */
  name?: string;
  stats: readonly StandingStat[];
  /** Points to the next rank. Rendered as a sentence beneath the strip; null when unknown. */
  toNextRank: number | null;
};

export type Profile = {
  name: string;
  handle: string;
  avatar: string;
  /** Null when the API hasn't one yet: the card prints a dash. */
  level: number | null;
  winRate: number | null;
  loss: number | null;
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
  /** How they last received an order; the form starts there. */
  method?: "homeDelivery" | "pickup";
};
