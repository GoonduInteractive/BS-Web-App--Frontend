"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { PodiumFrame } from "@/components/competition/PodiumFrame";
import { Scene } from "@/components/competition/Scene";
import { Reveal } from "@/components/motion/Reveal";
import { SideScroller } from "@/components/ui/SideScroller";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { filterEntries, type LeaderboardFilter } from "@/lib/api/leaderboard";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";
import type {
  JourneyEntry,
  LeaderboardEntry,
  LeaderboardSeason,
  PodiumEntry,
} from "@/types/leaderboard";


export function Leaderboard({
  podium,
  rows,
  journey,
  messages,
}: {
  podium: readonly PodiumEntry[];
  rows: readonly LeaderboardEntry[];
  journey: JourneyEntry | null;
  messages: Messages;
}) {
  const t = messages.competition;
  const [filter, setFilter] = useState<LeaderboardFilter>({ region: "all", season: "all" });
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const shownPodium = useMemo(() => filterEntries(podium, filter), [podium, filter]);
  const shownRows = useMemo(() => filterEntries(rows, filter), [rows, filter]);


  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced || !root.current) return;
    const targets = root.current.querySelectorAll("[data-refresh]");
    let cancelled = false;
    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      gsap.fromTo(
        targets,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out", clearProps: "opacity,transform", overwrite: "auto" },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [filter, reduced]);

  const regionOptions: { value: LeaderboardFilter["region"]; label: string }[] = [
    { value: "all", label: t.leaderboard.allRegions },
    ...(["lagos", "abuja", "southEast", "rivers", "ghana"] as const).map((region) => ({
      value: region,
      label: t.regions[region],
    })),
  ];
  const seasonOptions: { value: LeaderboardSeason; label: string }[] = [
    { value: "all", label: t.leaderboard.allTime },
    { value: 2026, label: t.leaderboard.season.replace("{year}", "2026") },
    { value: 2025, label: t.leaderboard.season.replace("{year}", "2025") },
  ];

  return (
    <div ref={root} className="mx-auto w-full px-5 pt-16 lg:px-20 lg:pt-[6.3125rem]">
      {/* ---- FILTER BY ---- */}
      {/* Above the podium: the Reveal's translate makes it a stacking context,
          so the menu's own z-index cannot climb out of it — the row lifts as a
          whole, or the podium card drawn after it covers the open menu (the
          human's phone screenshot). */}
      <Reveal className="relative z-20 flex flex-wrap items-center justify-end gap-x-3.5 gap-y-3">
        <span className="text-menu-fg font-body text-[0.8125rem] leading-none font-semibold tracking-[0.02em] uppercase">
          {t.leaderboard.filterBy}
        </span>
        <FilterChip
          label={t.leaderboard.regionFilter}
          options={regionOptions}
          value={filter.region}
          onChange={(region) => setFilter((f) => ({ ...f, region }))}
        />
        <FilterChip
          label={t.leaderboard.timeFilter}
          options={seasonOptions}
          value={filter.season}
          onChange={(season) => setFilter((f) => ({ ...f, season }))}
        />
      </Reveal>

      {/* ---- The podium ---- */}
      <Podium entries={shownPodium} messages={messages} />

      {/* ---- The table: the `board` scene brings the rows in one after
          another. ---- */}
      <Scene scene="board" className="mt-12 lg:mx-5 lg:mt-18">
        <Board rows={shownRows} messages={messages} />
      </Scene>

      {/* ---- YOUR JOURNEY ---- */}
      {journey ? (
        <Reveal delay={80} className="mt-16 lg:mt-[6.25rem]">
          <h3 className="font-display text-menu-fg text-h5 font-semibold tracking-[-0.055em] uppercase">
            {t.leaderboard.journey}
          </h3>
          <div className="mt-8 lg:mx-5 lg:mt-[2.6875rem]">
            <Board rows={[journey]} journey messages={messages} />
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}


/* -------------------------------------------------------------------------- */
function FilterChip<V extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        root.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={`${label}: ${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="text-ink font-body focus-visible:outline-signal ease-gate flex h-7.5 min-w-[7.3125rem] cursor-pointer items-center justify-between gap-0.5 bg-[url('/assets/competition/filter-chip.svg')] bg-size-[100%_100%] bg-center bg-no-repeat pl-3.5 pr-1 text-[0.875rem] leading-none font-semibold tracking-[0.01em] uppercase transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:hover:translate-y-0"
      >
        {current.label}
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={cn("size-5 transition-transform duration-150 ease-gate", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="bg-menu-fg menu-in absolute top-full right-0 z-30 mt-2 min-w-[8.3125rem] p-2.5 shadow-lg"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={String(option.value)} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "text-ash font-body hover:bg-ash/8 focus-visible:outline-signal flex w-full cursor-pointer items-center justify-between gap-4 border border-transparent px-2.5 py-2 text-left text-[0.875rem] leading-none font-medium whitespace-nowrap uppercase transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2",
                    selected && "border-ash border-dashed",
                  )}
                >
                  {option.label}
                  {selected ? (
                    <svg
                      aria-hidden
                      viewBox="0 0 14 12"
                      className="w-3 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 6.5l4 4L13 1" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const STEP_ORDER: Record<PodiumEntry["step"], number> = { silver: 0, gold: 1, bronze: 2 };
const CHIP: Record<PodiumEntry["step"], string> = {
  gold: "bg-podium-gold",
  silver: "bg-podium-silver",
  bronze: "bg-podium-bronze",
};

function Podium({ entries, messages }: { entries: readonly PodiumEntry[]; messages: Messages }) {
  const t = messages.competition.leaderboard;
  const byStep = [...entries].sort((a, b) => STEP_ORDER[a.step] - STEP_ORDER[b.step]);
  const byRank = [...entries].sort((a, b) => a.rank - b.rank);
  const points = (entry: PodiumEntry) =>
    t.points.replace("{n}", new Intl.NumberFormat("en-NG", { useGrouping: false }).format(entry.points));
  const alt = (entry: PodiumEntry) =>
    t.podiumAlt.replace("{name}", entry.player.name).replace("{rank}", String(entry.rank));

  if (!entries.length) {
    return (
      <Reveal delay={40} className="mt-16 lg:mt-[6.875rem]">
        <p className="text-menu-fg/70 font-body text-body text-center">{t.empty}</p>
      </Reveal>
    );
  }

  return (
    <>
      <Scene scene="podium" className="mt-[6.875rem] hidden grid-cols-3 items-end lg:mx-[1.8125rem] lg:grid">
        {byStep.map((entry) => {
          const first = entry.step === "gold";
          return (
            <div key={entry.step} data-refresh className="flex flex-col items-center">
              <div data-podium-portrait className={cn(first ? "w-[13.875rem]" : "w-[11.3125rem]")}>
                <PodiumFrame
                  entry={entry}
                  alt={alt(entry)}
                  sizes={first ? "222px" : "181px"}
                  className="ease-gate transition-transform duration-500 hover:-translate-y-1.5 motion-reduce:hover:translate-y-0"
                />
              </div>
              <div data-podium-name className="flex flex-col items-center">
                <p className="font-display text-menu-fg mt-4.5 text-[2rem] leading-none font-semibold tracking-[-0.06em] uppercase">
                  {entry.player.name}
                </p>
                <p className="text-menu-fg font-body text-body">{entry.player.handle}</p>
              </div>

              <p
                data-podium-chip
                className={cn(
                  "font-display text-menu-fg relative z-10 mt-6 grid h-12 w-[8.1875rem] place-items-center text-[1.5rem] leading-none font-semibold tracking-[-0.02em] uppercase",
                  CHIP[entry.step],
                )}
              >
                {points(entry)}
              </p>
              <div
                data-podium-block
                className={cn(
                  "bg-pitch border-pewter font-display text-stone -mt-[1.0625rem] grid w-full place-items-center border text-[6.25rem] leading-none font-semibold",
                  first ? "h-[15.875rem]" : "h-[11.625rem]",
                )}
                aria-hidden
              >
                {entry.rank}
              </div>
            </div>
          );
        })}
      </Scene>

      {/* Phone: stacked cards, 318 x 153 in the 360 frame, in rank order. */}
      <Scene scene="podium" className="mt-14 space-y-5 lg:hidden">
        {byRank.map((entry) => (
          <div
            key={entry.step}
            data-podium-card
            data-refresh
            className="bg-pitch border-pewter relative flex h-[9.5625rem] items-center gap-2 overflow-hidden border pl-1"
          >
            <PodiumFrame entry={entry} alt={alt(entry)} sizes="125px" className="w-[7.8125rem] shrink-0" />
            <div className="relative z-10 min-w-0">
              <p className="font-display text-menu-fg text-[2rem] leading-none font-semibold tracking-[-0.06em] uppercase">
                {entry.player.name}
              </p>
              <p className="text-menu-fg font-body text-body mt-1">{entry.player.handle}</p>
              <p
                className={cn(
                  "font-display text-menu-fg mt-3.5 grid h-9.25 w-25 place-items-center text-[1.125rem] leading-none font-semibold uppercase",
                  CHIP[entry.step],
                )}
              >
                {points(entry)}
              </p>
            </div>
            {/* The numeral, cut by the card's bottom-right corner. */}
            <span
              aria-hidden
              className="font-display text-stone pointer-events-none absolute -right-1 -bottom-6 text-[6.25rem] leading-none font-semibold"
            >
              {entry.rank}
            </span>
          </div>
        ))}
      </Scene>
    </>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The ranking table, and YOUR JOURNEY's single row with its extra column
 */
function Board({
  rows,
  journey = false,
  messages,
}: {
  rows: readonly (LeaderboardEntry | JourneyEntry)[];
  journey?: boolean;
  messages: Messages;
}) {
  const t = messages.competition;
  const c = t.leaderboard.columns;
  const group = (n: number) => new Intl.NumberFormat("en-NG").format(n);
  const cell = "border-steel border-l px-3 first:border-l-0";
  const head = `${cell} text-mist font-body text-body h-14.5 font-normal`;
  const body = `${cell} text-mist font-body text-body h-19`;
  const centre = "text-center";
  const left = "text-left";

  return (
    <SideScroller className="lg:overflow-visible">
      <table className={cn("w-full border-collapse", journey ? "min-w-[60rem]" : "min-w-[52rem]")}>
        <caption className="sr-only">{journey ? t.leaderboard.journeyCaption : t.leaderboard.caption}</caption>
        {journey ? (
          <colgroup>
            <col className="w-[11.03%]" />
            <col className="w-[29.55%]" />
            <col className="w-[11.84%]" />
            <col className="w-[11.84%]" />
            <col className="w-[11.84%]" />
            <col className="w-[11.92%]" />
            <col className="w-[11.98%]" />
          </colgroup>
        ) : (
          <colgroup>
            <col className="w-[10.97%]" />
            <col className="w-[29.6%]" />
            <col className="w-[14.84%]" />
            <col className="w-[14.84%]" />
            <col className="w-[14.84%]" />
            <col className="w-[14.91%]" />
          </colgroup>
        )}
        <thead>
          <tr className="bg-iron">
            <th scope="col" className={`${head} ${centre}`}>{c.rank}</th>
            <th scope="col" className={`${head} ${left}`}>{journey ? c.playerSolo : c.player}</th>
            <th scope="col" className={`${head} ${centre}`}>{c.region}</th>
            <th scope="col" className={`${head} ${centre}`}>{c.points}</th>
            <th scope="col" className={`${head} ${centre}`}>{c.champion}</th>
            <th scope="col" className={`${head} ${centre}`}>{c.winRate}</th>
            {journey ? <th scope="col" className={`${head} ${centre}`}>{c.nextRank}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                key={`${row.rank}-${row.player.handle}`}
                data-row
                data-refresh
                className={cn(
                  "ease-gate relative transition-[outline-color,transform] duration-200 outline-1 -outline-offset-1 outline-transparent",
                  "hover:z-10 hover:outline-disabled-fg focus-within:z-10 focus-within:outline-disabled-fg",
                  "lg:hover:[transform:scale(1.015)] lg:focus-within:[transform:scale(1.015)] motion-reduce:hover:[transform:none]",
                  index % 2 ? "bg-iron" : "bg-slate",
                )}
              >
                <td className={`${body} ${centre}`}>{row.rank}</td>
                <td className={`${body} ${left}`}>
                  <span className="flex items-center gap-3">
                    {/* 33 in the frame, with a thin dark-red ring. */}
                    <span className="ring-ember relative size-8.25 shrink-0 overflow-hidden rounded-full ring-1">
                      <Image src={row.player.avatar} alt="" fill sizes="33px" className="object-cover object-top" />
                    </span>
                    <span className="min-w-0">
                      <span className="text-menu-fg block truncate leading-tight">{row.player.name}</span>
                      <span className="text-disabled-fg text-body-sm block truncate leading-tight">
                        {row.player.handle}
                      </span>
                    </span>
                  </span>
                </td>
                <td className={`${body} ${centre}`}>{t.regions[row.region]}</td>
                <td className={`${body} ${centre}`}>{group(row.points)}</td>
                <td className={`${body} ${centre}`}>{t.champions[row.champion]}</td>
                <td className={`${body} ${centre}`}>{row.winRate}%</td>
                {journey && "pointsToNextRank" in row ? (
                  <td className={`${body} ${centre} whitespace-nowrap`}>
                    {t.leaderboard.pointsAway.replace("{n}", group(row.pointsToNextRank))}
                  </td>
                ) : null}
              </tr>
            ))
          ) : (
            <tr className="bg-slate">
              <td colSpan={journey ? 7 : 6} className={`${body} ${centre}`}>
                <EmptyNote>{t.leaderboard.empty}</EmptyNote>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </SideScroller>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <span className="text-mist/80">{children}</span>;
}
