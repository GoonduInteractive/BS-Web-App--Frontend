import { Countdown } from "@/components/competition/Countdown";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Match } from "@/types/tournament";

/**
 * One match: a white time plate over two player rows, each a linen name plate
 * with a red score plate beside it. Figma: `Tournament details page
 * ongoing.png`, the CURRENT MATCHUPS cards at 1598 and every bracket card.
 *
 * WHAT THE FRAME MEASURES, on a 271-wide card:
 *
 *   time    270 x 32, white, Teko 16 black at 21 in — "ENDS 24 :00:00" live,
 *           "SAT, 21 JULY 8:00 AM" scheduled, and the same form for the date a
 *           decided match was played (the frame counts those down too, which
 *           is the comp's clock pasted over finished games)
 *   rows    12 under the plate and 12 apart; 72 tall
 *   name    166 wide, --color-linen, Teko 32 black at 22 in
 *   score   105 wide, white Teko 24 with a smaller PTS; --color-signal on the
 *           side that leads, --color-ember on the other; "- PTS" and NIL when
 *           the match is not yet set
 *
 * THE COUNTDOWN COUNTS. The frame's "24 :00:00" is a picture of a clock; a
 * live match here carries when it ends and `Countdown` ticks to it. A
 * scheduled match prints its date in the visitor's locale.
 *
 * The card lifts a little under the cursor. That is a CSS `translate` on this
 * root, so the scenes that bring the cards in tween the WRAPPER each card sits
 * in, never the card — see the note on `useGsapScene`.
 */
export function MatchCard({
  match,
  messages,
  locale,
  className,
}: {
  match: Match;
  messages: Messages;
  locale: Locale;
  className?: string;
}) {
  const t = messages.competition.detail.matchups;
  const [a, b] = match.sides;
  const lead = a && b && a.points !== undefined && b.points !== undefined ? (a.points >= b.points ? 0 : 1) : 0;

  const dated = match.scheduledAt ?? match.playedAt;
  const when = match.endsAt ? (
    <Countdown to={match.endsAt} pattern={t.ends} />
  ) : dated ? (
    matchDate(dated, locale)
  ) : null;

  return (
    <div
      className={cn(
        "ease-gate w-[16.9375rem] shrink-0 transition-transform duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <p className="bg-menu-fg font-display text-ink flex h-8 items-center pl-5.25 text-[1rem] leading-none font-semibold tracking-[-0.02em] uppercase">
        {when}
      </p>
      <div className="mt-3 space-y-3">
        {match.sides.map((side, index) => (
          <div key={index} className="flex h-18">
            <p className="bg-linen font-display text-ink flex w-[10.375rem] items-center pl-5.5 text-[2rem] leading-none font-semibold tracking-[-0.06em] uppercase">
              {side ? side.handle : t.nil}
            </p>
            <p
              className={cn(
                "font-display text-menu-fg flex flex-1 items-center justify-center gap-1 text-[1.5rem] leading-none font-semibold tracking-[-0.03em] uppercase",
                index === lead ? "bg-signal" : "bg-ember",
              )}
            >
              {side?.points !== undefined ? (
                <Points value={side.points} pattern={t.pts} />
              ) : (
                t.noPts
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * "SAT, 21 JULY 8:00 AM" — the frame's order, which no locale's default gives:
 * weekday, a comma, day, month, then the time. Assembled from the parts.
 */
function matchDate(iso: string, locale: Locale): string {
  const parts = new Intl.DateTimeFormat(locale === "ig" ? "ig" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    // Lagos time, stated: a static build renders on whatever machine builds it,
    // and 8:00 AM WAT must not become 7:00 AM because that machine keeps UTC.
    timeZone: "Africa/Lagos",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("hour")}:${get("minute")} ${get("dayPeriod")}`;
}

/** "2000 PTS" with the unit a step smaller, as the frame sets it. */
function Points({ value, pattern }: { value: number; pattern: string }) {
  const [before, after] = pattern.split("{n}");
  return (
    <>
      {before}
      {new Intl.NumberFormat("en-NG", { useGrouping: false }).format(value)}
      <span className="text-[1.125rem]">{after}</span>
    </>
  );
}
