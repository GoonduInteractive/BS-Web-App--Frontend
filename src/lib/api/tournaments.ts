import type { BracketRound, Match, Stage, StageKey, Tournament } from "@/types/tournament";

/**
 * Tournaments, behind a typed contract.
 *
 * NO BACKEND. Everything here is the Competition frame's own data, carried as
 * dates and numbers rather than as the strings the frame prints, so the page
 * derives what it shows and stays right tomorrow. When the game team's schema
 * lands, this file starts reading it and nothing above it changes.
 *
 * The dates are consistent with the overview: tournaments begin rolling out
 * from October 2026, and the frame's active cards start on October 5 and end
 * on October 12.
 */
/* ------------------------------------------------------------------------ */
/* Detail-page fixtures                                                       */
/* ------------------------------------------------------------------------ */

const STAGE_ORDER: readonly StageKey[] = [
  "registration",
  "qualifiers",
  "groupStage",
  "quarterFinals",
  "semiFinals",
  "finals",
];

/**
 * Six stages with everything before `current` completed, `current` in
 * progress and the rest upcoming; `null` for a tournament that has not begun.
 */
function stagesUpTo(current: StageKey | null): readonly Stage[] {
  const at = current ? STAGE_ORDER.indexOf(current) : -1;
  return STAGE_ORDER.map((key, i) => ({
    key,
    status: i < at ? "completed" : i === at ? "inProgress" : "upcoming",
  }));
}

/**
 * THE LAGOS BRACKET IS NOT THE FRAME'S. The frame fills every round-of-16 and
 * quarter-final card with "SOMAMAIN 2000 · CHIHUNTER 1000" — a comp filling a
 * tree. Mocks here carry plausible data, so the sixteen are the four handles
 * the frame's CURRENT MATCHUPS name plus the leaderboard's eight players and
 * four more, each round-of-16 result feeding the quarter-final it decides. The
 * quarter-finals are live (`endsAt`), the semis and final are scheduled and
 * undecided — the frame's NIL. FLAGGED as mock data throughout.
 *
 * THE LIVE MATCHES END RELATIVE TO THE BUILD — tomorrow evening, Lagos time —
 * because a fixed date is a countdown that has already reached 00:00:00 the
 * day after it is written, which is how the first one was found. Everything
 * else keeps fixed ISO dates; a match that has been played has a date.
 */
/** An ISO instant `days` from now at `hour` o'clock West Africa Time. */
function lagosEvening(days: number, hour: number): string {
  const d = new Date(Date.now() + days * 86_400_000);
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(d); // YYYY-MM-DD
  return `${day}T${String(hour).padStart(2, "0")}:00:00+01:00`;
}
const R16 = (id: string, a: string, ap: number, b: string, bp: number, playedAt: string): Match => ({
  id,
  sides: [{ handle: a, points: ap }, { handle: b, points: bp }],
  playedAt,
});
const LIVE = (id: string, a: string, ap: number, b: string, bp: number, endsAt: string): Match => ({
  id,
  sides: [{ handle: a, points: ap }, { handle: b, points: bp }],
  endsAt,
});
const OPEN = (id: string, scheduledAt: string): Match => ({ id, sides: [null, null], scheduledAt });

const LAGOS_BRACKET: readonly BracketRound[] = [
  {
    key: "roundOf16",
    matches: [
      R16("r16-1", "somamain", 2000, "bashir_ad", 1000, "2026-09-05T16:00:00+01:00"),
      R16("r16-2", "chihunter", 2000, "ngozi_ok", 1200, "2026-09-05T18:00:00+01:00"),
      R16("r16-3", "kairaking", 1800, "tamunob", 1400, "2026-09-05T20:00:00+01:00"),
      R16("r16-4", "spiritwolf", 2000, "kwame_m", 900, "2026-09-06T16:00:00+01:00"),
      R16("r16-5", "nzeforce", 2000, "amaraeze", 1100, "2026-09-06T18:00:00+01:00"),
      R16("r16-6", "ironmask", 1600, "tundeb", 1500, "2026-09-06T20:00:00+01:00"),
      R16("r16-7", "ashwalker", 2000, "ify_nwa", 800, "2026-09-07T16:00:00+01:00"),
      R16("r16-8", "sunspear", 1700, "chidera_okk", 1300, "2026-09-07T18:00:00+01:00"),
    ],
  },
  {
    key: "quarterFinals",
    matches: [
      LIVE("qf-1", "somamain", 2000, "chihunter", 1000, lagosEvening(1, 18)),
      LIVE("qf-2", "kairaking", 1000, "spiritwolf", 2000, lagosEvening(1, 18)),
      LIVE("qf-3", "nzeforce", 1400, "ironmask", 1400, lagosEvening(1, 20)),
      LIVE("qf-4", "ashwalker", 1800, "sunspear", 600, lagosEvening(1, 20)),
    ],
  },
  {
    key: "semiFinals",
    matches: [OPEN("sf-1", "2026-09-19T08:00:00+01:00"), OPEN("sf-2", "2026-09-19T08:00:00+01:00")],
  },
  { key: "finals", matches: [OPEN("f-1", "2026-09-26T08:00:00+01:00")] },
];

const TOURNAMENTS: readonly Tournament[] = [
  {
    slug: "wrath-of-nze-ugwuoke",
    copyKey: "wrathOfNze",
    status: "registrationOpen",
    region: "global",
    startsAt: "2026-10-24",
    // The frame reads 42 DAYS on 2026-09-11, the day it was measured.
    closesAt: "2026-10-23",
    participants: 12_458,
    rewards: ["skins", "titles", "frames"],
    format: "oneVone",
    prizePool: 500_000,
    slots: { taken: 128, total: 256 },
    detail: { stages: stagesUpTo("registration") },
  },
  {
    slug: "lagos-ascendant-league",
    copyKey: "lagosLeague",
    status: "active",
    region: "lagos",
    startsAt: "2026-09-01",
    endsAt: "2026-10-12",
    participants: 128,
    format: "oneVone",
    detail: {
      stages: stagesUpTo("quarterFinals"),
      bracket: LAGOS_BRACKET,
      // 128 entered, 64 matches to reach sixteen; the finals date is the
      // bracket's, so UNTIL FINALS counts to it rather than repeating a figure.
      stats: { registered: 128, matchesPlayed: 64, roundsRemaining: 3, finalsAt: "2026-09-26" },
    },
  },
  {
    slug: "eastern-province-cup",
    copyKey: "easternCup",
    status: "open",
    region: "southEast",
    startsAt: "2026-10-05",
    closesAt: "2026-10-04",
    format: "oneVone",
    detail: { stages: stagesUpTo("registration") },
  },
  {
    slug: "rivers-state-trial",
    copyKey: "riversTrial",
    status: "comingSoon",
    region: "rivers",
    detail: { stages: stagesUpTo(null) },
  },
];

/** The tournament the FEATURED TOURNAMENT card shows — the first in the list. */
export async function getFeaturedTournament(): Promise<Tournament> {
  return TOURNAMENTS[0];
}

/** One tournament by its slug, for the detail route. */
export async function getTournament(slug: string): Promise<Tournament | undefined> {
  return TOURNAMENTS.find((tournament) => tournament.slug === slug);
}

/** Every tournament that has a detail page, for `generateStaticParams`. */
export async function getTournamentSlugs(): Promise<readonly string[]> {
  return TOURNAMENTS.filter((tournament) => tournament.detail).map((tournament) => tournament.slug);
}

/** The ACTIVE TOURNAMENTS row: everything that is not the featured one. */
export async function getActiveTournaments(): Promise<readonly Tournament[]> {
  return TOURNAMENTS.slice(1);
}

/**
 * Whole days from now until an ISO date, floored at zero.
 *
 * Shared by TIME REMAINING and anything else that counts down. `Date.now()`
 * runs at build for a static page, so the figure is as fresh as the last
 * deploy — the same trade the news feed's relative dates make.
 */
export function daysUntil(iso: string, now: number = Date.now()): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.ceil((then - now) / 86_400_000));
}
