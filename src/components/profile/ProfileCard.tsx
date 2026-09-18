import Image from "next/image";
import Link from "next/link";

import { EditGlyph, LogOutGlyph, NigeriaFlag } from "@/components/profile/ProfileGlyphs";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Profile } from "@/types/profile";

/**
 * The player profile card. Figma: `context/design/12-player-profile/`,
 * `Player profile.png` and `Player profile (1).png`.
 *
 * ONE COMPONENT, TWO STATES, AND THE DATA DECIDES. The two frames are the same
 * card with and without a tournament: `standing` null gives the empty rankings
 * panel and drops RANK from the stats row; populated gives the strip. No flag.
 *
 * Measured at 1440 — card 904 x 698 on `--color-pitch`, inner panels on
 * `--color-ash`, avatar 96 circle with a `--color-signal` ring, points column
 * 245 wide against a 537 rankings panel.
 *
 * THE CORNERS ARE ROUNDED, WHICH IS A DEPARTURE FROM THE SYSTEM. The button
 * sheet in overview section 8 says "Square corners throughout, nothing is
 * rounded" and every other page on this site obeys it. These frames draw a
 * rounded card and rounded inner panels, and Figma is binding where the two
 * disagree — so it is followed here and raised rather than silently squared.
 */
export function ProfileCard({
  profile,
  messages,
  locale,
}: {
  profile: Profile;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.profile;

  return (
    <div className="bg-pitch mx-auto w-full max-w-[56.5rem] rounded-[1.25rem] px-6 py-10 md:px-14 md:py-11.5">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-11">
        <div className="border-signal relative size-24 shrink-0 overflow-hidden rounded-full border-2">
          <Image
            src={profile.avatar}
            alt={t.avatarAlt}
            fill
            priority
            sizes="96px"
            className="scale-[1.35] object-cover object-top select-none"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-6 md:-mt-5">
            <div className="min-w-0">
              <h1 className="font-display text-menu-fg mt-5 text-[2.0625rem] leading-none font-semibold tracking-[-0.035em] uppercase">
                {profile.name}
              </h1>
              <p className="text-menu-fg/85 font-body text-body mt-3 leading-none">
                {profile.handle}
              </p>
            </div>

            <Link
              href={`/${locale}/profile/edit`}
              className="border-menu-fg/90 text-menu-fg font-body focus-visible:outline-signal inline-flex h-11 items-center gap-2.5 rounded-md border px-4 text-[0.9375rem] leading-none transition-colors duration-150 ease-gate hover:bg-menu-fg/10 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <EditGlyph />
              {t.edit}
            </Link>
          </div>

          <div className="mt-11 flex flex-wrap items-start justify-between gap-8">
            <dl className="flex flex-wrap gap-x-11 gap-y-5">
              <Stat label={t.stats.level} value={String(profile.level)} />
              <Stat label={t.stats.winRate} value={`${profile.winRate}%`} />
              <Stat label={t.stats.loss} value={`${profile.loss}%`} />
              {/* Only once the player is placed. */}
              {profile.rank !== undefined ? (
                <Stat label={t.stats.rank} value={`#${profile.rank}`} />
              ) : null}
            </dl>

            <div>
              <dt className="text-menu-fg/85 font-body text-body-sm leading-none">{t.location}</dt>
              <dd className="font-display text-menu-fg mt-2.5 flex items-center gap-2 text-[0.9375rem] leading-none font-semibold tracking-[0.01em] uppercase">
                {profile.location}
                <NigeriaFlag />
              </dd>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-menu-fg/9 mt-8 md:mt-16.5" />

      <div className="mt-8 grid grid-cols-1 gap-5.5 md:mt-[3.875rem] lg:grid-cols-[30.9%_67.7%] lg:justify-between lg:gap-0">
        <div className="flex flex-col gap-5.5">
          <PointsTile label={t.gamePoints} value={profile.gamePoints} />
          <PointsTile label={t.claimablePoints} value={profile.claimablePoints} />
        </div>

        <section className="bg-ash rounded-lg px-6.5 pt-4.5 pb-4 lg:h-full">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-menu-fg font-body text-body leading-none tracking-[0.01em]">
              {t.rankings.title}
            </h2>

            {profile.standing ? (
              <span className="text-menu-fg/85 font-body inline-flex items-center gap-2 text-[0.8125rem] leading-none">
                {t.rankings.seeDetails}
                <span aria-hidden>→</span>
              </span>
            ) : null}
          </div>

          {profile.standing ? (
            <>
              <p className="text-menu-fg font-body text-body-sm mt-6 flex items-center gap-2.5 leading-none">
                <span className="bg-gild size-1.5 rounded-full" aria-hidden />
                {t.tournaments[profile.standing.nameKey as keyof typeof t.tournaments]}
              </p>

              <dl className="border-menu-fg/15 mt-4 grid grid-cols-2 rounded-lg border sm:grid-cols-4">
                {profile.standing.stats.map((stat, i) => (
                  <div
                    key={stat.labelKey}
                    className={`flex flex-col items-center px-4 py-5 ${
                      i ? "sm:border-menu-fg/15 sm:border-l" : ""
                    }`}
                  >
                    <span className="bg-gild grid size-6.5 place-items-center rounded-sm">
                      <Image
                        src={stat.glyph}
                        alt=""
                        aria-hidden
                        width={22}
                        height={22}
                        className="size-3.5 select-none"
                      />
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

              <p className="text-menu-fg/70 font-body mt-3.5 text-[0.8125rem] leading-none">
                {t.rankings.toNextRank.replace("{n}", String(profile.standing.toNextRank))}
              </p>
            </>
          ) : (
            <p className="text-menu-fg/85 font-body text-body-sm mt-6.5 leading-none">
              {t.rankings.empty}
            </p>
          )}
        </section>
      </div>

      {/* FLAGGED: there is no session to end. The control is drawn because the
          frame draws it, and it does nothing — the same state every other
          undestined CTA on this site is in. */}
      <div className="mt-12 flex justify-center md:mt-[4.125rem]">
        <button
          type="button"
          className="text-flare font-body focus-visible:outline-signal inline-flex cursor-pointer items-center gap-2.5 text-body leading-none transition-opacity duration-150 ease-gate hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogOutGlyph />
          {t.logOut}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-menu-fg/85 font-body text-body-sm leading-none">{label}</dt>
      <dd className="font-display text-menu-fg mt-2.5 text-[1.0625rem] leading-none font-semibold tracking-[0.01em]">
        {value}
      </dd>
    </div>
  );
}

function PointsTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-ash flex h-28 flex-col justify-between rounded-lg px-6 pt-5.5 pb-5.5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-menu-fg font-body text-body leading-none">{label}</p>
        <span className="bg-gild grid size-8 shrink-0 place-items-center rounded-sm">
          <Image
            src="/assets/merch/nsibidi-black.svg"
            alt=""
            aria-hidden
            width={22}
            height={22}
            className="size-4.5 select-none"
          />
        </span>
      </div>

      <p className="font-display text-menu-fg text-[1.9375rem] leading-none font-semibold tracking-[-0.02em]">
        {value.toLocaleString("en-NG")}
      </p>
    </div>
  );
}
