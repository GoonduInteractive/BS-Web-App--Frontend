import type { SeedsBalance } from "@/types/seeds";

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
  name: string;
  /** Its slug, for See Details. */
  slug: string;
  /** Whether the site has a page for it: a finished one has none (`lib/api/tournaments.ts`). */
  hasPage: boolean;
  stats: readonly StandingStat[];
  /**
   * Points to the next rank IN THIS TOURNAMENT, rendered as a sentence beneath
   * the strip. The API sends no such figure per tournament yet, so it is null.
   */
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
  /** Their Seeds: the Calabash is what the CALABASH tile shows. */
  seeds: SeedsBalance;
  /** The Play Games player ID their account is linked to; null until they connect one. */
  playGamesId: string | null;
  /**
   * Every tournament the player is in, running ones first. Empty when they are
   * in none - the frame's first state.
   */
  standings: readonly TournamentStanding[];
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
