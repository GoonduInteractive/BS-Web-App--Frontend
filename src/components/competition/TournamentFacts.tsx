import { Scene } from "@/components/competition/Scene";
import { TornDivider } from "@/components/ui/TornDivider";
import { daysUntil } from "@/lib/api/tournaments";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Tournament } from "@/types/tournament";

/**
 * The facts strip under the tournament hero, and the torn edge that bites the
 * hero above it. Figma: `Tournament (upcoming).png`, y ~622..850 at 1440.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   tear     the hero's foot, teeth from ~622, strip to 678, reading #120202
 *   labels   cap 10 at 796 → Host Grotesk 14, #e8e8e8 (menu-fg at 92%)
 *   values   cap 12 at 822 → Teko 20, white, uppercase
 *   columns  330 / 536 / 735 / 876 / 1056 - the row is CENTRED (330..1108 is
 *            719 about the page's 720), with ~88 between columns
 *
 * THE FACTS FOLLOW THE STATUS, as the tournament cards' do. Registration open:
 * status, time remaining, region, participants, format. Running: status, when
 * it ends, region, participants, format. Announced: status and region. The
 * ongoing frame pastes the featured card's facts (REGISTRATION OPEN, 42 DAYS,
 * a REWARDS POOL column) over a tournament in its quarter-finals; the data
 * wins, and the rewards live in the REWARDS accordion below rather than here,
 * as the upcoming frame has it.
 */
export function TournamentFacts({
  tournament,
  messages,
  locale,
}: {
  tournament: Tournament;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.competition;
  const f = t.detail.facts;
  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale === "ig" ? "ig" : "en-US", { month: "long", day: "numeric" }).format(
      new Date(iso),
    );

  const facts: { label: string; value: string }[] = [{ label: f.status, value: t.status[tournament.status] }];
  if (tournament.closesAt && (tournament.status === "registrationOpen" || tournament.status === "open")) {
    facts.push({
      label: f.timeRemaining,
      value: t.featured.days.replace("{n}", String(daysUntil(tournament.closesAt))),
    });
  }
  if (tournament.status === "active" && tournament.endsAt) {
    facts.push({ label: f.ends, value: date(tournament.endsAt) });
  }
  facts.push({ label: f.region, value: t.regions[tournament.region] });
  if (tournament.participants !== undefined) {
    facts.push({
      label: f.participants,
      value: t.featured.players.replace(
        "{n}",
        new Intl.NumberFormat("en-NG").format(tournament.participants),
      ),
    });
  }
  if (tournament.format) facts.push({ label: f.format, value: t.formats[tournament.format] });

  return (
    <section>
      <TornDivider edge="top" seed={6104} className="text-roster-top relative z-20 -mt-14" />
      <Scene
        scene="facts"
        as="dl"
        // The phone frame lays the facts left-aligned in two rows with 40
        // between them; the desktop frame centres one row with 88.
        className="mx-auto flex w-full flex-wrap gap-x-10 gap-y-7 px-5 pt-16 lg:justify-center lg:gap-x-22 lg:gap-y-8 lg:px-20 lg:pt-[7.0625rem]"
      >
        {facts.map((fact) => (
          <div key={fact.label} data-fact>
            <dt className="text-menu-fg/92 font-body text-body-sm">{fact.label}</dt>
            <dd className="font-display text-menu-fg text-h6 mt-0.5 font-semibold tracking-[-0.055em] uppercase">
              {fact.value}
            </dd>
          </div>
        ))}
      </Scene>
    </section>
  );
}
