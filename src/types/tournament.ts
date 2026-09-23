/**
 * Tournament contracts. Overview section 9 names `Tournament` as one of the
 * shapes to define now and build against mocks, so that when the game team
 * delivers a schema only the adapter in `src/lib/api/tournaments.ts` changes.
 *
 * Copy is never carried here. Names, descriptions, statuses, regions and reward
 * names are all KEYS into `messages.competition`, the same arrangement
 * `PointsBalance.perkKeys` uses - the adapter says which, the locale says what.
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

/**
 * Where a tournament is played. Leaderboards launch Nigeria-first by state, so
 * regions are states or "global". Keys into `messages.competition.regions`.
 */
export type TournamentRegion = "global" | "lagos" | "southEast" | "rivers" | "abuja" | "ghana";

/** A prize class in the rewards pool. Keys into `messages.competition.rewards`. */
export type TournamentReward = "skins" | "titles" | "frames";

/** Match format, as the registration sheet prints it. Keys into `messages.competition.formats`. */
export type TournamentFormat = "oneVone";

export type Tournament = {
  slug: string;
  /** Key into `messages.competition.tournaments` - name, and description where one exists. */
  copyKey: string;
  status: TournamentStatus;
  region: TournamentRegion;
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
  rewards?: readonly TournamentReward[];
  /** The registration sheet's facts. Present once a tournament can be joined. */
  format?: TournamentFormat;
  /** Prize pool in naira. */
  prizePool?: number;
  /** Places taken and places available. */
  slots?: { taken: number; total: number };
  /** The detail page's content. Absent means the tournament has no page yet. */
  detail?: TournamentDetail;
};

/* ------------------------------------------------------------------------ */
/* The detail page                                                           */
/* ------------------------------------------------------------------------ */

/**
 * The six stages of the journey to ascension, in order. Keys into
 * `messages.competition.detail.stages`.
 */
export type StageKey =
  | "registration"
  | "qualifiers"
  | "groupStage"
  | "quarterFinals"
  | "semiFinals"
  | "finals";

/** Where a stage is, as the frame's chips colour it: amber, red, or scar. */
export type StageStatus = "inProgress" | "completed" | "upcoming";

export type Stage = { key: StageKey; status: StageStatus };

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
  /** Live: when it ends, counted down. */
  endsAt?: string;
  /** Scheduled: when it is played, printed. */
  scheduledAt?: string;
  /** Decided: when it was played, printed. */
  playedAt?: string;
};

/** Which bracket rounds exist. Keys into `messages.competition.detail.rounds`. */
export type RoundKey = "roundOf16" | "quarterFinals" | "semiFinals" | "finals";

export type BracketRound = { key: RoundKey; matches: readonly Match[] };

/**
 * What the detail page needs beyond the card's facts. Present on every
 * tournament that has a page; the ongoing parts are present only while it runs.
 */
export type TournamentDetail = {
  stages: readonly Stage[];
  /** The bracket, from its first round to the final. Ongoing tournaments only. */
  bracket?: readonly BracketRound[];
  /** The ongoing frame's four figures. `finalsAt` is what UNTIL FINALS counts to. */
  stats?: { registered: number; matchesPlayed: number; roundsRemaining: number; finalsAt: string };
};
