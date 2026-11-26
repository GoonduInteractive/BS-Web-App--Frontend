import Image from "next/image";
import Link from "next/link";

import { LogOutButton } from "@/components/profile/LogOutButton";
import { PlayGamesPanel } from "@/components/profile/PlayGamesPanel";
import { ProfileInvite } from "@/components/profile/ProfileInvite";
import { TournamentRankings } from "@/components/profile/TournamentRankings";
import { EditGlyph, NigeriaFlag } from "@/components/profile/ProfileGlyphs";
import { SupportNote } from "@/components/ui/SupportNote";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Profile } from "@/types/profile";
import { isRemoteImage } from "@/lib/utils/remote-image";

/**
 * The player profile card. Figma: `context/design/12-player-profile/`,
 * `Player profile.png` and `Player profile (1).png`.
 *
 * ONE COMPONENT, TWO STATES, AND THE DATA DECIDES. The two frames are the same
 * card with and without a tournament: no `standings` gives the empty rankings
 * panel; any gives the strip (`TournamentRankings`). No flag.
 *
 * Measured at 1440 - card 904 x 698 on `--color-pitch`, inner panels on
 * `--color-ash`, avatar 96 circle with a `--color-signal` ring, points column
 * 245 wide against a 537 rankings panel.
 *
 * THE CORNERS ARE ROUNDED, WHICH IS A DEPARTURE FROM THE SYSTEM. The button
 * sheet in overview section 8 says "Square corners throughout, nothing is
 * rounded" and every other page on this site obeys it. These frames draw a
 * rounded card and rounded inner panels, and Figma is binding where the two
 * disagree - so it is followed here and raised rather than silently squared.
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
            unoptimized={isRemoteImage(profile.avatar)}
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
              {/* A dash where the API hasn't a figure yet, rather than a 0 it never said. */}
              <Stat label={t.stats.level} value={profile.level === null ? "—" : String(profile.level)} />
              <Stat label={t.stats.winRate} value={profile.winRate === null ? "—" : `${profile.winRate}%`} />
              <Stat label={t.stats.loss} value={profile.loss === null ? "—" : `${profile.loss}%`} />
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
          {/* Seeds, the community's own points: the game keeps a separate economy, so its points
              aren't shown here (the team, 2026-11-17). The usable Seeds are what's in the Calabash,
              the wallet, with any on hold under them; the Legacy is everything ever earned. */}
          <PointsTile
            label={t.usableSeeds}
            value={profile.seeds.calabash}
            note={profile.seeds.pending > 0 ? t.pendingNote.replace("{count}", count(profile.seeds.pending)) : undefined}
          />
          <PointsTile label={t.legacySeeds} value={profile.seeds.legacy} note={t.legacyNote} />
        </div>

        <TournamentRankings standings={profile.standings} messages={messages} locale={locale} />
      </div>

      <ProfileInvite messages={messages} locale={locale} />

      <PlayGamesPanel playGamesId={profile.playGamesId} messages={messages} />

      {/* Support on the left, Log Out moved to the right (`new-updates/Player
          profile.png`, 2026-09-26). A stack on the phone, Log Out last. */}
      <div className="mt-12 flex flex-col items-center gap-8 text-center md:mt-9 md:flex-row md:items-center md:justify-between md:gap-6 md:px-1 md:text-left">
        <SupportNote messages={messages} layout="plain" />
        <LogOutButton label={t.logOut} locale={locale} />
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

/** `note` is a quiet line under the figure; with one, the tile grows to hold it. */
function PointsTile({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="bg-ash flex min-h-28 flex-col justify-between gap-3 rounded-lg px-6 pt-5.5 pb-5.5">
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

      <div>
        <p className="font-display text-menu-fg text-[1.9375rem] leading-none font-semibold tracking-[-0.02em]">
          {value.toLocaleString("en-NG")}
        </p>
        {note ? <p className="text-menu-fg/60 font-body mt-2 text-[0.8125rem] leading-snug">{note}</p> : null}
      </div>
    </div>
  );
}

const count = (n: number) => n.toLocaleString("en-NG");
