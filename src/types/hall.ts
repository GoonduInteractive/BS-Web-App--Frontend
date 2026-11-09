/**
 * A HALL OF ASCENSION entry - a season's champion, written in the CMS. The
 * handle is the player's, as the profile's `@somamain` is.
 */
export type HallEntry = {
  slug: string;
  /** The champion's handle, printed in caps by the card. */
  handle: string;
  season: number;
  /** The tournament the season was named for, where there was one. */
  tournament?: string;
  /** A path under `public/`, e.g. `/assets/hall/somamain.png`. */
  portrait: string;
};
