import Image from "next/image";

import { BracketButton } from "@/components/ui/BracketButton";
import { TornDivider } from "@/components/ui/TornDivider";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Tournament } from "@/types/tournament";

export function TournamentCard({
  tournament,
  messages,
  locale,
}: {
  tournament: Tournament;
  messages: Messages;
  locale: Locale;
}) {
  const facts = factsFor(tournament, messages, locale);
  const cta = ctaFor(tournament.status, messages);
  // One CTA per card, as the frame draws it, and it goes to the tournament's
  // own page whatever it says: VIEW DETAILS is the page, and REGISTER NOW is
  // the page too, because that is where the facts and the registration sheet
  // both are - a card has no room to show what someone is signing up for.
  const href = `/${locale}/competition/${tournament.slug}`;

  return (
    <article className="group @container bg-arena-card relative flex flex-col overflow-hidden">
      {/* ---- The plate ---- */}
      <div aria-hidden className="pointer-events-none relative h-[70.15cqw] select-none">
        <div className="absolute top-[-33.01cqw] left-[-56.8cqw] w-[178.88cqw]">
          <Image
            src="/assets/characters/soma-nysc.png"
            alt=""
            width={4096}
            height={4096}
            sizes="(min-width: 1024px) 52vw, 160vw"
            className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
        <div className="absolute top-[-7.767cqw] left-[3.883cqw] w-[113.59cqw]">
          <Image
            src="/assets/competition/soma-front.png"
            alt=""
            width={936}
            height={968}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      </div>


      <TornDivider edge="top" depth={12} seed={2136} className="text-charcoal relative -mt-5" />
      <div className="bg-charcoal relative flex flex-1 flex-col px-8 pb-12">
        <h3 className="font-display text-menu-fg/92 text-h2 mt-11 min-h-21.5 leading-[0.9] font-semibold tracking-[-0.07em] uppercase">
          {tournament.name}
        </h3>

        <dl className="mt-11 grid grid-cols-2 gap-y-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-mist font-body text-body-sm">{fact.label}</dt>
              <dd className="font-display text-menu-fg text-h6 mt-0.5 font-semibold tracking-[-0.055em] uppercase">
                {fact.value}
              </dd>
            </div>
          ))}

          {cta ? (
            <div className="col-span-2 -ml-0.5 flex items-center @min-[25.25rem]:col-span-1">
              <BracketButton
                size="sm"
                href={href}
                className="px-3.5 py-4 text-[0.875rem] leading-none tracking-normal whitespace-nowrap"
              >
                {cta}
              </BracketButton>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

/**
 * The fact rows a status shows, in the frame's order. The CTA, when there is
 * one, takes the fourth cell, which is why STATUS always comes third.
 */
function factsFor(tournament: Tournament, messages: Messages, locale: Locale) {
  const t = messages.competition;
  const region = { label: t.active.labels.region, value: tournament.region };
  const status = { label: t.active.labels.status, value: t.status[tournament.status] };

  switch (tournament.status) {
    case "active":
      return [
        { label: t.active.labels.ends, value: formatDay(tournament.endsAt, locale) },
        region,
        status,
      ];
    case "open":
      return [
        { label: t.active.labels.starts, value: formatDay(tournament.startsAt, locale) },
        region,
        status,
      ];
    default:
      return [region, status];
  }
}

function ctaFor(status: Tournament["status"], messages: Messages): string | null {
  const t = messages.competition.cta;
  if (status === "active") return t.details;
  if (status === "open" || status === "registrationOpen") return t.register;
  return null;
}

/**
 * "OCTOBER 12", as the frame writes it - month first, which is `en-US` rather
 * than Nigeria's day-first `en-NG`. Igbo has its own month names in ICU and
 * takes them. The card sets it in caps. Nothing to print is an empty cell, not
 * a placeholder.
 */
function formatDay(iso: string | undefined, locale: Locale): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ig" ? "ig" : "en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
