import Image from "next/image";

import { RegisterFlow } from "@/components/competition/RegisterFlow";
import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import { daysUntil } from "@/lib/api/tournaments";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Tournament } from "@/types/tournament";


export function FeaturedCard({
  tournament,
  messages,
  locale,
}: {
  tournament: Tournament;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.competition;
  // The slot can hold a running tournament when none is open: nothing to join.
  const canRegister = tournament.status === "registrationOpen" || tournament.status === "open";

  const days = tournament.closesAt ? daysUntil(tournament.closesAt) : null;
  const participants =
    tournament.participants === undefined
      ? ""
      : t.featured.players.replace(
          "{n}",
          new Intl.NumberFormat("en-NG").format(tournament.participants),
        );

  return (
    <Reveal className="relative grid lg:grid-cols-[649fr_631fr] xl:grid-cols-[minmax(0,1fr)_39.4375rem]">
      <Image
        src="/assets/competition/Rectangle pattern-tear.png"
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 1024px) 100vw, 250vw"
        className="object-cover lg:object-fill"
      />

      {/* ---- The sheet ---- */}
      <div className="relative px-6 pt-10 pb-10 lg:pl-9 lg:pt-13 lg:pb-12.25">

        <h3 className="font-display text-ink text-section-heading max-w-104 font-semibold tracking-[-0.058em] uppercase">
          {tournament.name}
        </h3>


        <p className="text-ash font-body text-body mt-3.75 max-w-lg">
          {tournament.description}
        </p>

        <dl className="mt-6.25 flex flex-wrap gap-x-9 gap-y-7">
          <Field label={t.featured.labels.status} value={t.status[tournament.status]} />
          <Field
            label={t.featured.labels.timeRemaining}
            value={days === null ? "" : t.featured.days.replace("{n}", String(days))}
          />
          <Field label={t.featured.labels.region} value={tournament.region} />
        </dl>
        <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-7">
          <Field label={t.featured.labels.participants} value={participants} />
          <Field label={t.featured.labels.rewards} value={tournament.rewards ?? ""} />
        </dl>


        <div className="mt-12.25 -ml-1 flex flex-wrap gap-6.5">

          {canRegister ? (
            <RegisterFlow
              tournament={tournament}
              messages={messages}
              locale={locale}
              profileHref={`/${locale}/profile`}
            />
          ) : null}

          <BracketButton
            tone="outline"
            field="light"
            href={`/${locale}/competition/${tournament.slug}`}
            className="px-3.5 py-4.25 leading-none tracking-normal whitespace-nowrap"
          >
            {t.cta.details}
          </BracketButton>
        </div>
      </div>

      {/* ---- The plate ---- */}
      <div className="group bg-tournament-plate relative aspect-631/593 overflow-hidden lg:aspect-auto">
        <Image
          src="/assets/competition/nze.png"
          alt={t.featured.plateAlt}
          fill
          sizes="(min-width: 1440px) 631px, (min-width: 1024px) 44vw, 100vw"
          className="object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
    </Reveal>
  );
}

/** One label-over-value pair of the card's fact rows. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate font-body text-body-sm">{label}</dt>
      <dd className="font-display text-ash text-h6 mt-0.5 font-semibold tracking-[-0.055em] uppercase">
        {value}
      </dd>
    </div>
  );
}
