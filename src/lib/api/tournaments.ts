import { cache } from "react";
import { z } from "zod";

import type { Locale } from "@/lib/utils/locales";
import { getMessages, type Messages } from "@/lib/utils/messages";
import { formatPrice } from "@/lib/utils/price";
import type {
  BracketRound,
  Match,
  MatchSide,
  Stage,
  Tournament,
  TournamentDetail,
  TournamentStatus,
} from "@/types/tournament";

import { ApiError, apiGet, fromMinor, publicHandle } from "./client";

/**
 * Tournaments, behind a typed contract.
 *
 * They come from the game backend's public `/v1/tournaments`, `/{slug}` and
 * `/{slug}/bracket`, read on the server: at build, and again when the pages
 * revalidate. Admins create them in the admin's Tournaments page.
 *
 * WHAT THE SITE SHOWS OF THE API'S STATUSES: registration open, active and
 * coming soon. Drafts are an admin's; COMPLETED AND CANCELLED ONES ARE LEFT OUT
 * of the lists and have no page - no frame draws a finished tournament, and
 * there is no copy for one. FLAGGED.
 *
 * WHICH ONE IS FEATURED: the one an admin marked `featured`, else the first
 * with registration open, else the first listed. An open tournament reads
 * REGISTRATION OPEN in that slot and on its page, OPEN on a card - the
 * frames' own labels for the same state.
 *
 * WHAT THE API DOESN'T SAY, and what the site does about it (FLAGGED):
 * - in-game rewards are a yes or no, not a list, so REWARDS POOL prints the
 *   prize pool in naira, or nothing;
 * - qualifiers and a group stage aren't a tree, so the bracket draws the
 *   knockout rounds only; before the draw, a field too big for the bracket
 *   shows the API's qualifier leaderboard instead (`qualifier`, since
 *   2026-11-02), a ranked table no frame draws;
 * - a live match has no end time, so CURRENT MATCHUPS prints when it was
 *   scheduled rather than counting down.
 */

/* ------------------------------------------------------------------------ */
/* Live                                                                       */
/* ------------------------------------------------------------------------ */

const apiTournament = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  mode: z.string().nullish(),
  featured: z.boolean().default(false),
  status: z.string(),
  registration_closes_at: z.string().nullish(),
  starts_at: z.string().nullish(),
  ends_at: z.string().nullish(),
  is_paid: z.boolean().default(false),
  fee_minor: z.coerce.number().nullish(),
  prize_pool_minor: z.coerce.number().nullish(),
  player_slots: z.number().nullish(),
  entries: z.coerce.number().default(0),
  region: z.object({ name: z.string(), slug: z.string() }).nullish(),
});
type ApiTournament = z.output<typeof apiTournament>;

const apiPlayer = z.object({ username: z.string().nullish(), game_player_id: z.string().nullish() }).nullish();

const apiMatch = z.object({
  id: z.string(),
  stage: z.string(),
  position: z.number().default(0),
  status: z.string(),
  scheduled_at: z.string().nullish(),
  played_at: z.string().nullish(),
  player1: apiPlayer,
  player2: apiPlayer,
  player1_score: z.number().nullish(),
  player2_score: z.number().nullish(),
});
type ApiMatch = z.output<typeof apiMatch>;

const apiDetail = apiTournament.extend({
  stats: z
    .object({
      matches_played: z.number().nullish(),
      rounds_remaining: z.number().nullish(),
      days_to_final: z.number().nullish(),
      registered: z.coerce.number().default(0),
    })
    .nullish(),
  // A stage's dates since 2026-11-02, ISO strings live; the spec types them loosely, so only a string is taken.
  journey: z
    .array(z.object({ key: z.string(), label: z.string(), state: z.string(), started_at: z.unknown().optional(), ended_at: z.unknown().optional() }))
    .default([]),
  current_matchups: z.array(apiMatch).default([]),
});

const apiBracket = z.object({
  drawn: z.boolean().default(false),
  stages: z.array(z.object({ stage: z.string(), label: z.string(), matches: z.array(apiMatch) })).default([]),
  // Since 2026-11-02: the ranked field, when more entered than the bracket seats.
  qualifier: z
    .object({
      cutoff: z.number(),
      entries: z.array(
        z.object({
          rank: z.number(),
          username: z.string().nullish(),
          region_name: z.string().nullish(),
          points: z.coerce.number().default(0),
          through: z.boolean().default(false),
        }),
      ),
    })
    .nullish(),
});

/** Where a card, the featured slot or the page shows it; the labels differ. */
type Slot = "card" | "featured" | "page";

function statusOf(status: string, slot: Slot): TournamentStatus | null {
  switch (status) {
    case "registration_open":
      return slot === "card" ? "open" : "registrationOpen";
    case "active":
      return "active";
    case "coming_soon":
      return "comingSoon";
    default:
      return null;
  }
}

const shown = (t: ApiTournament) => statusOf(t.status, "card") !== null;

function fromApi(t: ApiTournament, slot: Slot, locale: Locale, messages: Messages): Tournament | null {
  const status = statusOf(t.status, slot);
  if (!status) return null;
  const prizePool = t.prize_pool_minor ? fromMinor(t.prize_pool_minor) : undefined;
  return {
    id: t.id,
    slug: t.slug,
    name: t.title,
    ...(t.description && { description: t.description }),
    status,
    region: t.region?.name ?? messages.competition.regions.global,
    ...(t.starts_at && { startsAt: t.starts_at }),
    ...(t.ends_at && { endsAt: t.ends_at }),
    ...(t.registration_closes_at && { closesAt: t.registration_closes_at }),
    participants: t.entries,
    ...(prizePool !== undefined && {
      prizePool,
      rewards: formatPrice(prizePool, locale, messages.merch.price),
    }),
    ...(t.mode && { format: t.mode }),
    ...(t.is_paid && t.fee_minor ? { fee: fromMinor(t.fee_minor) } : {}),
    ...(t.player_slots != null && { slots: { taken: t.entries, total: t.player_slots } }),
    detail: { stages: [] },
  };
}

/** Read once per render, however many sections ask. */
const liveList = cache(() => apiGet("/v1/tournaments", z.array(apiTournament)));

/** The API's stage keys, mapped to the site's copy where it has some. */
const STAGE_COPY: Record<string, keyof Messages["competition"]["detail"]["stages"]> = {
  registration: "registration",
  qualifiers: "qualifiers",
  group_stage: "groupStage",
  quarter_finals: "quarterFinals",
  semi_finals: "semiFinals",
  finals: "finals",
};
const ROUND_COPY: Record<string, keyof Messages["competition"]["detail"]["rounds"]> = {
  round_of_16: "roundOf16",
  quarter_finals: "quarterFinals",
  semi_finals: "semiFinals",
  finals: "finals",
};
/** The rounds the bracket draws, first to last: the knockout ones. */
const KNOCKOUT = ["round_of_32", "round_of_16", "quarter_finals", "semi_finals", "finals"];

function toSide(player: ApiMatch["player1"], score: number | null | undefined): MatchSide | null {
  if (!player) return null;
  return {
    handle: publicHandle(player.username, player.game_player_id) ?? "—",
    ...(score != null && { points: score }),
  };
}

function toMatch(m: ApiMatch): Match {
  const played = m.status === "played";
  return {
    id: m.id,
    sides: [toSide(m.player1, m.player1_score), toSide(m.player2, m.player2_score)],
    ...(played && m.played_at && { playedAt: m.played_at }),
    ...(!played && m.scheduled_at && { scheduledAt: m.scheduled_at }),
  };
}

const JOURNEY_STATE: Record<string, Stage["status"]> = { done: "completed", in_progress: "inProgress" };

async function liveTournament(slug: string, locale: Locale): Promise<Tournament | undefined> {
  const messages = getMessages(locale);
  const t = messages.competition.detail;
  let detail: z.output<typeof apiDetail>;
  try {
    detail = await apiGet(`/v1/tournaments/${encodeURIComponent(slug)}`, apiDetail);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return undefined;
    throw e;
  }
  const tournament = fromApi(detail, "page", locale, messages);
  if (!tournament) return undefined;

  // No bracket yet is an error to some APIs and `drawn: false` to this one.
  const bracket = await apiGet(`/v1/tournaments/${encodeURIComponent(slug)}/bracket`, apiBracket).catch(() => null);
  const rounds: BracketRound[] = !bracket?.drawn
    ? []
    : KNOCKOUT.flatMap((key) => {
        const stage = bracket.stages.find((s) => s.stage === key);
        if (!stage?.matches.length) return [];
        const copy = ROUND_COPY[key];
        return [
          {
            key,
            label: copy ? t.rounds[copy] : stage.label,
            matches: [...stage.matches].sort((a, b) => a.position - b.position).map(toMatch),
          },
        ];
      });

  const running = tournament.status === "active";
  const page: TournamentDetail = {
    stages: detail.journey
      .filter((s) => s.state !== "skipped")
      .map((s) => ({
        key: s.key,
        label: STAGE_COPY[s.key] ? t.stages[STAGE_COPY[s.key]] : s.label,
        status: JOURNEY_STATE[s.state] ?? "upcoming",
        ...(typeof s.started_at === "string" && s.started_at && { startsAt: s.started_at }),
        ...(typeof s.ended_at === "string" && s.ended_at && { endsAt: s.ended_at }),
      })),
    ...(detail.current_matchups.length > 0 && { matchups: detail.current_matchups.map(toMatch) }),
    ...(rounds.length > 0 && { bracket: rounds }),
    // Before the draw, a field bigger than the bracket plays qualifiers on a leaderboard.
    ...(rounds.length === 0 &&
      bracket?.qualifier?.entries.length && {
        qualifier: {
          cutoff: bracket.qualifier.cutoff,
          entries: [...bracket.qualifier.entries]
            .sort((a, b) => a.rank - b.rank)
            .map((q) => ({
              rank: q.rank,
              handle: publicHandle(q.username) ?? "—",
              ...(q.region_name && { region: q.region_name }),
              points: q.points,
              through: q.through,
            })),
        },
      }),
    ...(running &&
      detail.stats && {
        stats: {
          registered: detail.stats.registered,
          matchesPlayed: detail.stats.matches_played ?? null,
          roundsRemaining: detail.stats.rounds_remaining ?? null,
          daysToFinal: detail.stats.days_to_final ?? null,
        },
      }),
  };
  return { ...tournament, detail: page };
}

/* ------------------------------------------------------------------------ */
/* The contract                                                               */
/* ------------------------------------------------------------------------ */

/** The tournament the FEATURED TOURNAMENT card shows, or null when there is none. */
export async function getFeaturedTournament(locale: Locale): Promise<Tournament | null> {
  const messages = getMessages(locale);

  const list = (await liveList()).filter(shown);
  const pick =
    list.find((t) => t.featured) ?? list.find((t) => t.status === "registration_open") ?? list[0];
  return pick ? fromApi(pick, "featured", locale, messages) : null;
}

/** The ACTIVE TOURNAMENTS row: everything that is not the featured one. */
export async function getActiveTournaments(locale: Locale): Promise<readonly Tournament[]> {
  const messages = getMessages(locale);

  const featured = await getFeaturedTournament(locale);
  return (await liveList())
    .filter((t) => t.slug !== featured?.slug)
    .flatMap((t) => fromApi(t, "card", locale, messages) ?? []);
}

/** One tournament by its slug, with what its page needs, for the detail route. */
export async function getTournament(slug: string, locale: Locale): Promise<Tournament | undefined> {
  return liveTournament(slug, locale);
}

/** Every tournament that has a detail page, for `generateStaticParams` and the sitemap. */
export async function getTournamentSlugs(): Promise<readonly string[]> {
  return (await liveList()).filter(shown).map((t) => t.slug);
}

/**
 * Whole days from now until an ISO date, floored at zero.
 *
 * Shared by TIME REMAINING and anything else that counts down. `Date.now()`
 * runs at build for a static page, so the figure is as fresh as the last
 * deploy - the same trade the news feed's relative dates make.
 */
export function daysUntil(iso: string, now: number = Date.now()): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.ceil((then - now) / 86_400_000));
}
