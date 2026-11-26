"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { TournamentStanding } from "@/types/profile";

/**
 * TOURNAMENT RANKINGS on the profile card (`Player profile (1).png`).
 *
 * The frame draws ONE tournament: its name after a gild dot, the strip, See
 * Details at the panel's head. A player can be in several, so each name
 * becomes a choice and the dot marks the one shown. With one tournament it is
 * the frame exactly: a plain line, nothing to pick. No frame for several;
 * FLAGGED.
 *
 * See Details opens the shown tournament's page; a finished one has no page,
 * so it gets no link.
 */
export function TournamentRankings({
  standings,
  messages,
  locale,
}: {
  standings: readonly TournamentStanding[];
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.profile;
  const [picked, setPicked] = useState(0);
  const shown = standings[Math.min(picked, standings.length - 1)];

  return (
    <section className="bg-ash rounded-lg px-6.5 pt-4.5 pb-4 lg:h-full">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-menu-fg font-body text-body leading-none tracking-[0.01em]">{t.rankings.title}</h2>

        {shown?.hasPage ? (
          <Link
            href={`/${locale}/competition/${shown.slug}`}
            className="text-menu-fg/85 font-body focus-visible:outline-signal group inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] whitespace-nowrap leading-none transition-colors duration-150 ease-gate hover:text-menu-fg focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {t.rankings.seeDetails}
            <ArrowRight
              aria-hidden
              strokeWidth={1.5}
              className="size-3.5 transition-transform duration-200 ease-gate group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        ) : null}
      </div>

      {shown ? (
        <>
          {standings.length === 1 ? (
            <p className="text-menu-fg font-body text-body-sm mt-6 flex items-center gap-2.5 leading-none">
              <span className="bg-gild size-1.5 rounded-full" aria-hidden />
              {shown.name}
            </p>
          ) : (
            <div role="group" aria-label={t.rankings.title} className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
              {standings.map((standing, i) => {
                const on = standing === shown;
                return (
                  <button
                    key={standing.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked(i)}
                    // Not cn(): tailwind-merge reads text-body-sm as a colour and would drop it for the colour.
                    className={`font-body text-body-sm focus-visible:outline-signal flex cursor-pointer items-center gap-2.5 leading-none transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-4 ${
                      on ? "text-menu-fg" : "text-menu-fg/55 hover:text-menu-fg/85"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={cn("size-1.5 rounded-full", on ? "bg-gild" : "border-menu-fg/40 border")}
                    />
                    {standing.name}
                  </button>
                );
              })}
            </div>
          )}

          <dl className="border-menu-fg/15 mt-4 grid grid-cols-2 rounded-lg border sm:grid-cols-4">
            {shown.stats.map((stat, i) => (
              <div
                key={stat.labelKey}
                className={`flex flex-col items-center px-4 py-5 ${i ? "sm:border-menu-fg/15 sm:border-l" : ""}`}
              >
                <span className="bg-gild grid size-6.5 place-items-center rounded-sm">
                  <Image src={stat.glyph} alt="" aria-hidden width={22} height={22} className="size-3.5 select-none" />
                </span>
                <dt className="text-menu-fg/85 font-body mt-3 text-[0.8125rem] leading-none tracking-[0.02em]">
                  {t.standing[stat.labelKey]}
                </dt>
                <dd className="font-display text-menu-fg mt-2.5 text-[1.0625rem] leading-none font-semibold">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          {shown.toNextRank !== null ? (
            <p className="text-menu-fg/70 font-body mt-3.5 text-[0.8125rem] leading-none">
              {t.rankings.toNextRank.replace("{n}", String(shown.toNextRank))}
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-menu-fg/85 font-body text-body-sm mt-6.5 leading-none">{t.rankings.empty}</p>
      )}
    </section>
  );
}
