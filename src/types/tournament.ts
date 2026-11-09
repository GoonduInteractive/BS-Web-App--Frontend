/**
 * Tournament contracts, filled from the game backend's `/v1/tournaments` by
 * the adapter in `src/lib/api/tournaments.ts`.
 *
 * THE COPY A TOURNAMENT CARRIES IS RESOLVED: its name, description, region,
 * format and rewards arrive as the strings to print, as admins typed them (in
 * English - the API keeps one language). Only the STATUS
 * stays a key, because the site, not the record, says what each one reads.
 */

/**
 * Where a tournament is in its life, as the frames label it. The featured card
 * reads REGISTRATION OPEN; the active cards read ACTIVE, OPEN and COMING SOON.
 * Keys into `messages.competition.status`.
 *
 * The status decides what a card shows: an ACTIVE tournament prints when it
 * ENDS and offers details, an OPEN one prints when it STARTS and offers
 * registration, and a COMING SOON one has no dates yet and no call to action.
 */
export type TournamentStatus = "registrationOpen" | "active" | "open" | "comingSoon";

export type Tournament = {
  /** The API's id - what an entry fee is paid against. */
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: TournamentStatus;
  /** Where it is played, as printed: "Lagos", "Global". */
  region: string;
  /** ISO date the tournament begins. Absent while it is only announced. */
  startsAt?: string;
  /** ISO date it ends. Absent until it is scheduled. */
  endsAt?: string;
  /**
   * ISO date registration closes. TIME REMAINING is derived from this rather
   * than stored, for the reason the news feed derives "5 DAYS AGO": a count
   * does not stay right, a date does. Absent once registration has closed.
   */
  closesAt?: string;
  participants?: number;
  /** REWARDS POOL, as printed: "EXCLUSIVE SKINS • SEASONAL TITLES • PROFILE FRAMES". */
  rewards?: string;
  /** Match format, as the registration sheet prints it: "1V1". */
  format?: string;
  /** Prize pool in naira. */
  prizePool?: number;
  /** Entry fee in naira. Absent for a free tournament. */
  fee?: number;
  /** Places taken and places available. */
  slots?: { taken: number; total: number };
  /** The detail page's content. Absent means the tournament has no page yet. */
  detail?: TournamentDetail;
};

/* ------------------------------------------------------------------------ */
/* The detail page                                                           */
/* ------------------------------------------------------------------------ */

/** Where a stage is, as the frame's chips colour it: amber, red, or scar. */
export type StageStatus = "inProgress" | "completed" | "upcoming";

/** One step of the journey to ascension, in order. `label` is printed. */
/** A stage of the journey, with when it started and ends where the API knows (since 2026-11-02). */
export type Stage = { key: string; label: string; status: StageStatus; startsAt?: string; endsAt?: string };

/** One side of a match. `points` is absent until the match has been played or is live. */
export type MatchSide = { handle: string; points?: number };

/**
 * A match in the bracket. A live match carries `endsAt` and the frame counts
 * it down; a scheduled one carries `scheduledAt` and prints the date. Sides
 * are `null` until the previous round decides them - the frame prints NIL.
 */
export type Match = {
  id: string;
  sides: readonly [MatchSide | null, MatchSide | null];
  /** When it ends, counted down. */
  endsAt?: string;
  /** Scheduled: when it is played, printed. */
  scheduledAt?: string;
  /** Decided: when it was played, printed. */
  playedAt?: string;
};

/** One column of the bracket. `label` is the round's heading, printed. */
export type BracketRound = { key: string; label: string; matches: readonly Match[] };

/**
 * What the detail page needs beyond the card's facts. Present on every
 * tournament that has a page; the ongoing parts are present only while it runs.
 */
export type TournamentDetail = {
  stages: readonly Stage[];
  /** CURRENT MATCHUPS: the matches being played now. */
  matchups?: readonly Match[];
  /** The bracket, from its first round to the final. Ongoing tournaments only. */
  bracket?: readonly BracketRound[];
  /**
   * The qualifier leaderboard, while more players are in than the 32-seat
   * bracket holds: ranked, the top `cutoff` going through. Live only.
   */
  qualifier?: {
    cutoff: number;
    entries: readonly { rank: number; handle: string; region?: string; points: number; through: boolean }[];
  };
  /** The ongoing frame's four figures; null where the source doesn't know one. */
  stats?: {
    registered: number;
    matchesPlayed: number | null;
    roundsRemaining: number | null;
    /** UNTIL FINALS, in whole days. */
    daysToFinal: number | null;
  };
};
