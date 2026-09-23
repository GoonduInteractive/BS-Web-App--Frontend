/**
 * Where players are, for the Active Player Map. The game backend will one day
 * supply these; `src/lib/api/players.ts` mocks them behind this shape.
 */
export type PlayerHotspot = {
  id: string;
  city: string;
  country: string;
  /** Decimal degrees, east and north positive - the city's pin. */
  lon: number;
  lat: number;
  /** Players active there now; always `players.length`. */
  active: number;
  /**
   * Each active player's own position in the city, for the map to show once
   * it is close enough that one pin for the city would hide them. As many as
   * `active`.
   */
  players: readonly PlayerPin[];
};

export type PlayerPin = {
  id: string;
  lon: number;
  lat: number;
};
