import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { GodsWatching } from "@/components/competition/GodsWatching";
import { JourneyStepper } from "@/components/competition/JourneyStepper";
import { TournamentFacts } from "@/components/competition/TournamentFacts";
import { TournamentHero } from "@/components/competition/TournamentHero";
import { TournamentProgress } from "@/components/competition/TournamentProgress";
import { TournamentRules } from "@/components/competition/TournamentRules";
import { JsonLd } from "@/components/chrome/JsonLd";
import { getTournament, getTournamentSlugs } from "@/lib/api/tournaments";
import { isHidden } from "@/lib/hidden-sections";
import { isLocale, LOCALES } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { localePath, pageMetadata, SITE_URL } from "@/lib/seo";

/**
 * A tournament's own page. Figma: `context/design/06-competition/Tournament
 * (upcoming).png`, `Tournament details page ongoing.png` and
 * `tornament-mobilee.png`.
 *
 * NOT A GATE ROUTE. It is reached from the competition page's cards and goes
 * back to it, so it renders plainly under the site chrome and ends on the
 * footer, like About - the ending the human chose over the phone frame's
 * pull-up. Every tournament with a `detail` gets a page; one without 404s.
 *
 * Two states, one page: a tournament that is running shows its current
 * matchups, figures and bracket between the journey and the rules; one that is
 * open or announced does not. The adapter decides by what it carries.
 *
 * A tournament an admin creates after the build is rendered on its first
 * visit and kept; every page is rebuilt in the background at most every five
 * minutes, so a bracket moves along while it is being played.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getTournamentSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const tournament = await getTournament(slug, locale);
  if (!tournament?.detail) return {};
  const t = getMessages(locale).competition;
  return pageMetadata({
    locale,
    path: `/competition/${tournament.slug}`,
    title: t.detail.metaTitle.replace("{name}", tournament.name),
    description: tournament.description ?? t.hero.body.split("\n").slice(0, 2).join(" "),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const tournament = await getTournament(slug, locale);
  if (!tournament?.detail) notFound();

  const messages = getMessages(locale);
  // Not public yet - the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("competition")) return <HiddenSection section="competition" locale={locale} messages={messages} />;

  const copy = { name: tournament.name, description: tournament.description };
  const canRegister = tournament.status === "registrationOpen" || tournament.status === "open";

  // The tournament as an event, with only what the record actually carries -
  // an announced tournament has no dates and says so by leaving them out.
  const structured = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: copy.name,
    ...(copy.description ? { description: copy.description } : {}),
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    ...(tournament.startsAt ? { startDate: tournament.startsAt } : {}),
    ...(tournament.endsAt ? { endDate: tournament.endsAt } : {}),
    location: { "@type": "VirtualLocation", url: new URL(localePath(locale, "/competition"), SITE_URL).toString() },
    organizer: { "@id": `${SITE_URL.origin}/#organization` },
    url: new URL(localePath(locale, `/competition/${tournament.slug}`), SITE_URL).toString(),
  };

  return (
    <main>
      <JsonLd data={structured} />
      <TournamentHero tournament={tournament} messages={messages} locale={locale} />
      <div className="bg-roster">
        <TournamentFacts tournament={tournament} messages={messages} locale={locale} />
        <JourneyStepper stages={tournament.detail.stages} messages={messages} locale={locale} />
        <TournamentProgress detail={tournament.detail} messages={messages} locale={locale} />
        <TournamentRules name={copy.name} running={tournament.status === "active"} messages={messages} />
        <GodsWatching messages={messages} cta={canRegister ? messages.competition.detail.registerNow : undefined} />
        <div className="pt-37.25">
          <SiteFooter messages={messages} locale={locale} />
        </div>
      </div>
    </main>
  );
}
