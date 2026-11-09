/**
 * An active regional league, as the REGIONAL LEAGUES list names them. Distinct
 * from the overview's `RegionDensity`, which is the player map's heat data and
 * arrives with the map; this is the list of places a league is running.
 * The name is the backend's, shown as it is in both locales: region names are
 * proper nouns (Abuja, Enugu, Lagos).
 */
export type ActiveRegion = {
  slug: string;
  name: string;
};
