"use client";

import { BookOpen, Gamepad2, Share2, Trophy, UserPlus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { CALABASH_ID } from "@/components/calabash/id";
import { SeedsFlag } from "@/components/hedera/SeedsFlag";
import { CodesList, NextRewardBar, RewardsList } from "@/components/merch/PointsPanel";
import { RedeemDialog } from "@/components/merch/RedeemDialog";
import { SeedIcon } from "@/components/ui/CurrencyIcons";
import { PanelTabs } from "@/components/ui/PanelTabs";
import { useMyRewardCodes, useMySeeds, useRewardTiers } from "@/hooks/useSeeds";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { RewardTier } from "@/types/seeds";

type Purse = "usable" | "legacy" | "hbar";

const count = (n: number) => new Intl.NumberFormat("en-NG").format(n);

const EARN = [
  ["read", BookOpen],
  ["share", Share2],
  ["invite", UserPlus],
  ["leaderboard", Trophy],
  ["events", Gamepad2],
] as const;

/**
 * THE CALABASH, the player's wallet on the site: the same on their profile
 * and their Hedera hub (the human, 2026-11-23). One tab per thing it holds,
 * each saying what it is and what it's for:
 *
 * - USABLE SEEDS: the balance and the bar to the next reward, then the
 *   rewards with REDEEM and the codes bought - the card that sat beside the
 *   store, and then under checkout, lives here now.
 * - LEGACY SEEDS: everything ever earned, and how Seeds are earned.
 * - HBAR, while the Hedera section runs: passed in as `hbar` (the wallet's
 *   balance and the linked wallet, `components/hedera/CalabashHbar.tsx`), so
 *   the profile loads none of the Hedera mock when the section is off.
 *
 * Each tab is a pair: the figure card on the left (with what the thing is,
 * in a line or two), what you can do with it on the right. Stacks on a phone.
 * No frame draws it: the profile's ash tiles, the site's tabs, the store
 * panel's own rows.
 */
export function Calabash({
  messages,
  locale,
  hbar,
  framed = false,
  className,
}: {
  messages: Messages;
  locale: Locale;
  /** The HBAR tab's two halves; absent, there is no HBAR tab. */
  hbar?: ReactNode;
  /** On its own (the hub): a panel of its own. Inside the profile card: bare. */
  framed?: boolean;
  className?: string;
}) {
  const c = messages.profile.calabash;
  const p = messages.merch.points;
  const seeds = useMySeeds();
  const tiers = useRewardTiers();
  const codes = useMyRewardCodes();
  const [purse, setPurse] = useState<Purse>("usable");
  // Each opening is one attempt: `key` starts the dialog afresh.
  const [redeeming, setRedeeming] = useState<{ tier: RewardTier; attempt: number } | null>(null);
  const flag = hbar ? <SeedsFlag messages={messages} /> : null;

  const tabs: { key: Purse; label: string }[] = [
    { key: "usable", label: c.tabs.usable },
    { key: "legacy", label: c.tabs.legacy },
    ...(hbar ? [{ key: "hbar" as const, label: c.tabs.hbar }] : []),
  ];
  const balance = seeds.data;

  return (
    <section
      id={CALABASH_ID}
      aria-labelledby="calabash-title"
      className={cn("scroll-mt-28", framed && "bg-pitch rounded-[1.25rem] px-6 py-8 md:px-10 md:py-10", className)}
    >
      <h2 id="calabash-title" className="text-menu-fg/85 font-body text-[1.1875rem] leading-none tracking-wider">
        {c.title}
      </h2>
      <p className="text-menu-fg/70 font-body text-body-sm mt-3 max-w-[36rem]">{hbar ? c.introHbar : c.intro}</p>

      <PanelTabs name="calabash" label={c.title} tabs={tabs} active={purse} onChange={setPurse} className="mt-6 -ml-2.5 flex-wrap gap-x-6 gap-y-2" />

      <div
        role="tabpanel"
        id={`calabash-panel-${purse}`}
        aria-labelledby={`calabash-tab-${purse}`}
        className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        {purse === "hbar" ? (
          hbar
        ) : !balance ? (
          <div aria-busy className="bg-ash h-56 rounded-lg lg:col-span-2" />
        ) : purse === "usable" ? (
          <>
            <CalabashFigure
              label={c.tabs.usable}
              flag={flag}
              glyph={<SeedGlyph />}
              value={count(balance.calabash)}
              unit={p.unit}
              about={c.usableAbout}
            >
              <NextRewardBar tiers={tiers.data ?? []} points={balance.calabash} messages={messages} className="mt-6" />
              {balance.pending > 0 ? <p className="text-menu-fg/60 font-body mt-3 text-[0.8125rem]">{p.pending.replace("{count}", count(balance.pending))}</p> : null}
            </CalabashFigure>
            <CalabashCard title={p.perksTitle}>
              <RewardsList
                tiers={tiers.data ?? []}
                points={balance.calabash}
                messages={messages}
                locale={locale}
                onRedeem={(tier) => setRedeeming((r) => ({ tier, attempt: (r?.attempt ?? 0) + 1 }))}
                className="mt-6"
              />
              {codes.data?.length ? (
                <div className="border-menu-fg/12 mt-8 border-t pt-7">
                  <h3 className="text-menu-fg/85 font-body text-[1.0625rem] leading-none tracking-wider">{p.codesTitle}</h3>
                  <p className="text-menu-fg/60 font-body mt-2.5 text-[0.8125rem]">{c.codesNote}</p>
                  <CodesList codes={codes.data} messages={messages} className="mt-5" />
                </div>
              ) : null}
            </CalabashCard>
          </>
        ) : (
          <>
            <CalabashFigure
              label={c.tabs.legacy}
              flag={flag}
              glyph={<SeedGlyph />}
              value={count(balance.legacy)}
              unit={p.unit}
              about={c.legacyAbout}
            />
            <CalabashCard title={c.earnTitle}>
              <ul className="mt-6 flex flex-col gap-4.5">
                {EARN.map(([key, Icon]) => (
                  <li key={key} className="flex items-center gap-4">
                    <span className="bg-gild grid size-9 shrink-0 place-items-center rounded-sm">
                      <Icon aria-hidden className="text-ink size-4.5" strokeWidth={1.75} />
                    </span>
                    <span className="text-menu-fg font-body text-body leading-snug">{c.earn[key]}</span>
                  </li>
                ))}
              </ul>
              <p className="text-menu-fg/60 font-body mt-7 text-[0.8125rem] leading-snug">{c.earnNote}</p>
            </CalabashCard>
          </>
        )}
      </div>

      {redeeming ? (
        <RedeemDialog key={redeeming.attempt} tier={redeeming.tier} messages={messages} locale={locale} onClose={() => setRedeeming(null)} />
      ) : null}
    </section>
  );
}

/** A tab's left half: what it is, how much, and a line or two on what it's for. */
export function CalabashFigure({
  label,
  flag,
  glyph,
  value,
  unit,
  empty,
  about,
  children,
}: {
  label: string;
  flag?: ReactNode;
  glyph: ReactNode;
  /** Null when there's nothing to count yet: `empty` says why. */
  value: string | null;
  unit?: string;
  empty?: string;
  about: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-ash flex flex-col rounded-lg px-6 pt-6 pb-6.5 md:px-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-menu-fg font-body text-body leading-none uppercase">{label}</p>
          {flag}
        </div>
        {glyph}
      </div>
      {value !== null ? (
        <p className="mt-6 flex flex-wrap items-baseline gap-x-2.5">
          <span className="font-display text-menu-fg text-[3.5rem] leading-none font-semibold tracking-[-0.01em] md:text-[4rem]">{value}</span>
          {unit ? <span className="font-display text-menu-fg text-[1.75rem] leading-none font-semibold tracking-[-0.02em]">{unit}</span> : null}
        </p>
      ) : (
        <p className="text-menu-fg/85 font-body text-body mt-6">{empty}</p>
      )}
      {children}
      {/* What it's for sits at the card's foot, however tall the right half makes the row. */}
      <div aria-hidden className="min-h-7 flex-1" />
      <p className="border-menu-fg/12 text-menu-fg/80 font-body text-body-sm border-t pt-5">{about}</p>
    </div>
  );
}

/** A tab's right half: what you can do with it. */
export function CalabashCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-ash rounded-lg px-6 pt-6 pb-7 md:px-7">
      <h3 className="text-menu-fg/85 font-body text-[1.0625rem] leading-none tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

/** The Seeds' seed on gold, as every Seeds tile carries it. */
function SeedGlyph() {
  return (
    <span className="bg-gild grid size-9 shrink-0 place-items-center rounded-sm">
      <SeedIcon className="text-ink size-5" />
    </span>
  );
}
