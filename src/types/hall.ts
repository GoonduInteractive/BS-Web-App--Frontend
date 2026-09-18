/**
 * A HALL OF ASCENSION entry — a season's champion. The handle is the player's,
 * as the profile's `@somamain` is; the tournament, where one is named, is a key
 * into `messages.competition.tournaments` so the hall and the tournaments
 * cannot spell it differently.
 */
export type HallEntry = {
  slug: string;
  /** The champion's handle, printed in caps by the card. */
  handle: string;
  season: number;
  /** The tournament the season was named for, where the frame names one. */
  tournamentKey?: string;
  portrait: { src: string; width: number; height: number };
};
