import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { TornDivider } from "@/components/ui/TornDivider";
import { getHallOfAscension } from "@/lib/api/hall";
import type { Messages } from "@/lib/utils/messages";
import type { HallEntry } from "@/types/hall";


export async function HallOfAscension({ messages }: { messages: Messages }) {
  const entries = await getHallOfAscension();
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

      <Reveal delay={160} className="mt-12 grid gap-5.5 sm:grid-cols-2 lg:mt-25 lg:grid-cols-3">
        {entries.map((entry) => (
          <HallCard key={entry.slug} entry={entry} messages={messages} />
        ))}
      </Reveal>
    </section>
  );
}

function HallCard({ entry, messages }: { entry: HallEntry; messages: Messages }) {
  const t = messages.competition.hall;
  const tournament = entry.tournamentKey
    ? messages.competition.tournaments[
        entry.tournamentKey as keyof typeof messages.competition.tournaments
      ].name
    : null;
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
        <Image
          src={entry.portrait.src}
          alt={alt}
          width={entry.portrait.width}
          height={entry.portrait.height}
          sizes="(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 92vw"
          className="absolute top-0 left-1/2 h-auto w-[92.6cqw] max-w-none -translate-x-1/2"
        />
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
