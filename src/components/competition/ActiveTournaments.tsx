import { TournamentCard } from "@/components/competition/TournamentCard";
import { Reveal } from "@/components/motion/Reveal";
import { getActiveTournaments } from "@/lib/api/tournaments";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

export async function ActiveTournaments({
  messages,
  locale,
}: {
  messages: Messages;
  locale: Locale;
}) {
  const tournaments = await getActiveTournaments();
  const t = messages.competition.active;

  return (
    <section className="mx-auto w-full px-6 pt-24 lg:px-20 lg:pt-44">
      <Reveal
        as="h2"
        className="font-display text-menu-fg text-section-heading text-center font-semibold tracking-[-0.058em] uppercase"
      >
        {t.heading}
      </Reveal>

      <Reveal delay={80} className="mx-auto mt-4.5 max-w-104">
        <p className="text-menu-fg font-body text-body text-center">{t.subtitle}</p>
      </Reveal>

      <Reveal delay={160} className="mt-11.5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament.slug}
            tournament={tournament}
            messages={messages}
            locale={locale}
          />
        ))}
      </Reveal>
    </section>
  );
}
