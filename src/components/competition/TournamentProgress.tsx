import { Fragment, type CSSProperties } from "react";

import { BracketScroller } from "@/components/competition/BracketScroller";
import { MatchCard } from "@/components/competition/MatchCard";
import { Scene } from "@/components/competition/Scene";
import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { BracketRound, Match, TournamentDetail } from "@/types/tournament";

/**
 * What a RUNNING tournament shows between the journey and the rules: CURRENT
 * MATCHUPS, four figures, and the full bracket. Figma: `Tournament details
 * page ongoing.png`, y 1526..4650 at 1440, and `tornament-mobilee.png`.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   heading    CURRENT MATCHUPS centred, cap 22 at 1526 → 36px, --text-h3
 *   cards      four 271-wide match cards from 1598, 37 under the heading
 *   VIEW FULL  a ghost bracket CTA centred 91 under the cards, white brackets
 *   stats      four 252 x 147 white cards, 19 apart, 125 under the CTA; Teko 63
 *              black numerals 40 in and 34 down, 16px labels 27 under them
 *   bracket    four columns of 271-wide cards with 158 gutters; round-of-16
 *              slots 289 tall and each round doubling; 3px --color-taupe
 *              connectors leaving a card at the join between its two players,
 *              meeting in the gutter's middle and entering the next card at its
 *              join; a 36px round heading 85 above each column's first card
 *
 * THE TREE TOUCHES BOTH EDGES OF THE PAGE. The frame draws it cut at the left
 * AND the right - the round of 16 runs off one side, the finals off the other -
 * so it is not held in the 80px container the rest of the page uses. The
 * columns are 271 and the gutters at least 158, which is 1558 for four rounds:
 * on a page wider than that the gutters grow and the first and last columns
 * sit ON the page's edges; on a narrower one the tree overflows a scroller
 * that opens on its middle, so both ends are cut as the comp has them and each
 * is a scroll away. Per the human.
 *
 * THE PHONE FRAME IS THE SAME TREE, not a stack: the round of 16 at 1x, 45 in
 * from the left edge, its cards 289 apart, and the stubs out of them running
 * off the right edge towards a round that is a scroll away. So below `lg` the
 * scroller opens on the left with a 45 inset instead of on its middle. Phone
 * widths elsewhere, from the same frame: matchup cards full width in a 28
 * gutter, 20 apart; the figures 254 wide, centred, 20 apart, 156 under the
 * ghost CTA, their numerals 55px.
 *
 * THE FIGURES ARE THE DATA'S: the API sends all four. The frame prints 12 DAYS and 4 rounds; the data says what it says,
 * and a dash where it says nothing.
 *
 * MOTION: three scenes from `competition-scenes` - `matchups` (the cards rise
 * in turn), `stats` (the cards rise and the numbers count up to their values)
 * and `bracket` (round by round: cards rise, then the lines out of them draw
 * across the gutter and on into the next round). The tweened targets are the
 * `data-*` wrappers; the hover lifts live on the cards inside them.
 */
export function TournamentProgress({
  detail,
  messages,
  locale,
}: {
  detail: TournamentDetail;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.competition.detail;
  const bracket = detail.bracket ?? [];
  const live = detail.matchups ?? [];
  const stats = detail.stats;

  return (
    <>
      {/* ---- CURRENT MATCHUPS ---- */}
      {live.length ? (
        <section className="mx-auto w-full px-7 pt-24 lg:px-20 lg:pt-37.5">
          <Reveal
            as="h2"
            className="font-display text-menu-fg text-h3 text-center font-semibold tracking-[-0.058em] uppercase"
          >
            {t.matchups.heading}
          </Reveal>
          <Scene scene="matchups" className="mt-9 flex flex-wrap justify-center gap-5 lg:mx-5 lg:grid lg:grid-cols-4 lg:gap-6">
            {live.map((match) => (
              <div key={match.id} data-match className="w-full sm:w-67.75 sm:shrink-0 lg:w-auto">
                <MatchCard match={match} messages={messages} locale={locale} className="w-full" />
              </div>
            ))}
          </Scene>
          <Reveal delay={160} className="mt-14 flex justify-center lg:mt-22.75">
            <BracketButton tone="ghost" href="#bracket" className="px-4 py-2 tracking-normal whitespace-nowrap">
              {t.matchups.viewBracket}
            </BracketButton>
          </Reveal>
        </section>
      ) : null}

      {/* ---- The four figures ---- */}
      {stats ? (
        <Scene
          scene="stats"
          as="section"
          className="mx-auto mt-39 grid w-full max-w-266.25 gap-5 px-13.25 sm:grid-cols-2 sm:px-6 lg:mt-31.25 lg:grid-cols-4 lg:px-0"
        >
          <Stat n={stats.registered} label={t.stats.registered} />
          <Stat n={stats.matchesPlayed} label={t.stats.matchesPlayed} />
          <Stat n={stats.roundsRemaining} label={t.stats.roundsRemaining} />
          <Stat n={stats.daysToFinal} pattern={t.stats.days} label={t.stats.untilFinals} />
        </Scene>
      ) : null}

      {/* ---- Qualifiers, before the draw ---- */}
      {detail.qualifier ? <Qualifiers board={detail.qualifier} messages={messages} /> : null}

      {/* ---- The bracket ---- */}
      {bracket.length ? (
        <Scene scene="bracket" as="section" id="bracket" className="w-full pt-24 lg:pt-62" aria-label={t.matchups.bracketLabel}>
          <Bracket rounds={bracket} messages={messages} locale={locale} />
        </Scene>
      ) : null}
    </>
  );
}

/**
 * QUALIFIERS: the API's ranked field while more players are in than the
 * bracket seats (`qualifier`). No frame draws it (FLAGGED): it takes the
 * Competition leaderboard's table - its cells, rule colour and banded rows -
 * with the cut drawn in signal red under the last player through.
 */
function Qualifiers({ board, messages }: { board: NonNullable<TournamentDetail["qualifier"]>; messages: Messages }) {
  const t = messages.competition.detail.qualifier;
  const group = (n: number) => new Intl.NumberFormat("en-NG").format(n);
  const cell = "border-steel border-l px-3 first:border-l-0 text-mist font-body text-body";
  const lastThrough = board.entries.findLastIndex((e) => e.through);

  return (
    <section aria-label={t.label} className="mx-auto w-full max-w-266.25 px-7 pt-24 lg:px-0 lg:pt-37.5">
      <Reveal as="h2" className="font-display text-menu-fg text-h3 text-center font-semibold tracking-[-0.058em] uppercase">
        {t.heading}
      </Reveal>
      <p className="text-menu-fg/85 font-body text-body mx-auto mt-3 max-w-xl text-center">
        {t.sub.replace("{cutoff}", String(board.cutoff))}
      </p>
      <div className="mt-9 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse">
          <thead>
            <tr className="bg-iron">
              <th scope="col" className={`${cell} h-14.5 text-center font-normal`}>{t.rank}</th>
              <th scope="col" className={`${cell} h-14.5 text-left font-normal`}>{t.player}</th>
              <th scope="col" className={`${cell} h-14.5 text-center font-normal`}>{t.region}</th>
              <th scope="col" className={`${cell} h-14.5 text-center font-normal`}>{t.points}</th>
            </tr>
          </thead>
          <tbody>
            {board.entries.map((e, i) => (
              <tr
                key={`${e.rank}-${e.handle}`}
                className={cn(i % 2 ? "bg-iron" : "bg-slate", !e.through && "opacity-60", i === lastThrough && "border-signal border-b-2")}
              >
                <td className={`${cell} h-14 text-center`}>{e.rank}</td>
                <td className={`${cell} h-14 text-left`}>
                  <span className="text-menu-fg">{e.handle}</span>
                  {e.through ? <span className="text-signal text-body-sm ml-2">{t.through}</span> : null}
                </td>
                <td className={`${cell} h-14 text-center`}>{e.region ?? "—"}</td>
                <td className={`${cell} h-14 text-center`}>{group(e.points)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * One figure. The number sits in its own span, marked with the value it counts
 * up to; `pattern` wraps it ("{n} DAYS") when the figure has a unit. The
 * outer div is the scene's target, the inner one lifts under the cursor. A
 * figure the source doesn't know is a dash, with no unit and nothing to count.
 */
function Stat({ n, pattern = "{n}", label }: { n: number | null; pattern?: string; label: string }) {
  const [before, after] = pattern.split("{n}");
  return (
    <div data-stat>
      <div className="bg-menu-fg text-ink ease-gate h-36.75 pt-8.5 pl-10 transition-transform duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0">
        <p className="font-display text-[3.4375rem] leading-none font-semibold tracking-[-0.058em] uppercase lg:text-section-heading lg:leading-[0.86]">
          {n === null ? (
            "—"
          ) : (
            <>
              {before}
              <span data-count={n}>{new Intl.NumberFormat("en-NG").format(n)}</span>
              {after}
            </>
          )}
        </p>
        <p className="font-body text-body mt-1.75 uppercase">{label}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** The round-of-16 slot: a 198 card and the frame's 91 between cards. */
const SLOT = 289;
const CARD = 198;
/** Where a connector meets a card: the join between its two player rows. */
const JOIN = 122;
/** The card's width and the gutter's MINIMUM; the gutters grow with the page. */
const CARD_W = 271;
const GUTTER = 158;

function Bracket({ rounds, messages, locale }: { rounds: readonly BracketRound[]; messages: Messages; locale: Locale }) {
  const height = SLOT * rounds[0].matches.length;
  const minWidth = rounds.length * CARD_W + (rounds.length - 1) * GUTTER;

  return (
    <BracketScroller className="w-full overflow-x-auto pt-24 pb-6 pl-11.25 lg:pl-0">
      <div className="flex w-full" style={{ height: height + 96, minWidth } as CSSProperties}>
        {rounds.map((round, r) => {
          const slot = SLOT * 2 ** r;
          const cardTop = (slot - CARD) / 2;
          return (
            <Fragment key={round.key}>
              <div data-round={r} className="relative w-67.75 shrink-0" style={{ "--slot": `${slot}px` } as CSSProperties}>
                {/* 85 above the first card's top - heading line box 40 tall. */}
                <h3
                  className="font-display text-menu-fg text-h3 absolute font-semibold tracking-[-0.058em] uppercase whitespace-nowrap"
                  style={{ top: cardTop - 85 - 5 } as CSSProperties}
                >
                  {round.label}
                </h3>
                {round.matches.map((match, k) => (
                  <div
                    key={match.id}
                    data-bracket-card
                    className="absolute left-0"
                    style={{ top: k * slot + cardTop } as CSSProperties}
                  >
                    <MatchCard match={match} messages={messages} locale={locale} />
                  </div>
                ))}
              </div>
              {r < rounds.length - 1 ? <Connectors index={r} matches={round.matches} slot={slot} cardTop={cardTop} /> : null}
            </Fragment>
          );
        })}
      </div>
    </BracketScroller>
  );
}

/**
 * The gutter between two rounds. The bus is centred with a calc on `left`,
 * not a translate: the `bracket` scene tweens its scale, and GSAP zeroes CSS
 * `translate` on anything it tweens (the warning on `useGsapScene`).
 */
function Connectors({ index, matches, slot, cardTop }: { index: number; matches: readonly Match[]; slot: number; cardTop: number }) {
  const pairs = Math.floor(matches.length / 2);
  return (
    <div data-gutter={index} className="relative flex-1" style={{ minWidth: GUTTER } as CSSProperties} aria-hidden>
      {Array.from({ length: pairs }, (_, p) => {
        const a = (2 * p) * slot + cardTop + JOIN;
        const b = (2 * p + 1) * slot + cardTop + JOIN;
        const mid = (a + b) / 2;
        return (
          <div key={p}>
            <span data-stub="out" className={cn(LINE, "left-0 w-1/2")} style={{ top: a } as CSSProperties} />
            <span data-stub="out" className={cn(LINE, "left-0 w-1/2")} style={{ top: b } as CSSProperties} />
            <span data-bus className="bg-taupe absolute left-[calc(50%-1.5px)] w-0.75" style={{ top: a, height: b - a + 3 } as CSSProperties} />
            <span data-stub="in" className={cn(LINE, "left-1/2 w-1/2")} style={{ top: mid } as CSSProperties} />
          </div>
        );
      })}
    </div>
  );
}

const LINE = "bg-taupe absolute h-0.75";
