import { Trophy } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TornDivider } from "@/components/ui/TornDivider";
import { getHallOfAscension } from "@/lib/api/hall";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { HallEntry } from "@/types/hall";

/**
 * HALL OF ASCENSION, written in the CMS (`hall` collection). Before the first
 * champion is published the heading stands over the empty state the team and
 * the roster use: the Coming Soon lines and a trophy, no CTA mid-page.
 */
export async function HallOfAscension({ messages, locale }: { messages: Messages; locale: Locale }) {
  const entries = await getHallOfAscension(locale);
  const t = messages.competition.hall;

  return (
    <section className="mx-auto w-full px-6 pt-24 lg:px-20 lg:pt-[8.375rem]">
      <div className="lg:flex lg:items-start lg:justify-between lg:gap-10">
        <Reveal
          as="h2"
          className="font-display text-menu-fg text-section-heading font-semibold tracking-[-0.058em] uppercase"
        >
          {t.heading}
        </Reveal>

        <Reveal delay={80} className="mt-6 lg:-mt-0.75 lg:w-98 lg:shrink-0">
          <p className="text-menu-fg font-body text-body">{t.aside}</p>
        </Reveal>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={Trophy} title={messages.comingSoon.title} body={messages.comingSoon.body} className="mt-14 xl:mt-23" />
      ) : (
        <Reveal delay={160} className="mt-12 grid gap-5.5 sm:grid-cols-2 lg:mt-25 lg:grid-cols-3">
          {entries.map((entry) => (
            <HallCard key={entry.slug} entry={entry} messages={messages} />
          ))}
        </Reveal>
      )}
    </section>
  );
}

function HallCard({ entry, messages }: { entry: HallEntry; messages: Messages }) {
  const t = messages.competition.hall;
  const tournament = entry.tournament;
  const season = t.season.replace("{n}", String(entry.season));
  const alt = t.portraitAlt.replace("{handle}", entry.handle).replace("{n}", String(entry.season));

  return (
    <article className="@container">
      <div className="bg-linen relative h-[90.62cqw] overflow-hidden">
        <Image
          src="/assets/competition/frame-pattern.png"
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top"
        />
        {/* The frame draws the render 92.6% of the card wide, from the top, cropped at the foot.
            Cover in a box that wide keeps that for the frame's 375x442 render and fits any upload. */}
        <div className="absolute top-0 left-1/2 h-full w-[92.6cqw] -translate-x-1/2">
          <Image
            src={entry.portrait}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 92vw"
            className="object-cover object-top"
          />
        </div>
      </div>

      <TornDivider edge="top" depth={14} seed={3117} className="text-clot -mt-3.5 relative" />
      <div className="bg-clot px-7 pt-1.75 pb-10">
        <h3 className="font-display text-menu-fg text-h2 font-semibold tracking-[-0.07em] uppercase">
          {entry.handle}
        </h3>
        <p className="text-menu-fg font-body text-body mt-0.5 font-semibold">
          {tournament ? `${season} – ${tournament}` : season}
        </p>
      </div>
    </article>
  );
}
