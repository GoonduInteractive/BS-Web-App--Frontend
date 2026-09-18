"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";

import { InviteFriends } from "@/components/community/InviteFriends";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";
import type { PlayerHotspot } from "@/types/players";

/**
 * The Active Player Map panel: the search, the copy column and the disc.
 * Figma: `05-community/Active player map.png` at 1440 and
 * `05-community/mobile-active-map/home/game.png` at 360.
 *
 * WHAT THE 1440 FRAME MEASURES:
 *
 *   search   537..903 x 498..545 — a 366 x 48 pill in the CTA's slot, a
 *            --color-disabled-fg ring, "Search a Location" 14px, a pin glyph
 *   LOCATION 16px at cap 740, x 164; the place Teko cap 36 at 775 → 56px
 *   ACTIVE   14px at cap 879; the count Teko cap 22 at 905 → 35px
 *   disc     524..1256 x 664..1342; the footer's rule at 1614
 *
 * AND THE 360 FRAME: the pill 15..344 x 617..664; the disc 734..1363 tall and
 * wider than the screen, centred, cut at both edges; LOCATION cap 1472, the
 * place 1502, ACTIVE PLAYERS 1623, the count 1642; INVITE FRIENDS from 1753
 * (see `InviteFriends`); the footer's rule at 2064.
 *
 * THE DISC IS A CIRCLE. Both frames draw it as an ellipse — 732 x 678 at 1440,
 * ~738 x 629 at 360, two different ratios — which reads as a circle resized
 * off-square in Figma rather than a shape, since the dotted world inside it is
 * not squashed. Built round, at each frame's WIDTH (732; 175vw on a phone),
 * with the top where each frame puts it, so the circle runs 27px lower than
 * the ellipse at 1440. FLAGGED for Design.
 *
 * The copy column sits in the disc's upper third, not centred on it: LOCATION's
 * cap is 76 below the disc's top at 1440. Below `lg` the column follows the disc,
 * as the phone frame stacks it.
 *
 * (The torn glyph at 96..152 x 762..818 is the SoundToggle where the first
 * viewport puts it, as on the merch and competition frames — not the panel's.)
 *
 * THE MAP LOADS WHEN THE TAB DOES. `next/dynamic` with no server render:
 * Leaflet, the land data and the pins are ~70KB gzipped the wall's visitors
 * never need, and a map is nothing a crawler reads.
 *
 * The search is a combobox over the hotspots — the places that have players —
 * because that is what a visitor is looking for here, and a place with none
 * has nothing to show. Choosing one selects it: the copy column reads it and
 * the map flies there. A pin does the same.
 */
const ActiveMap = dynamic(() => import("@/components/community/ActiveMap").then((m) => m.ActiveMap), {
  ssr: false,
  loading: () => <div aria-hidden className="bg-globe aspect-square w-full rounded-full" />,
});

export function MapPanel({
  hotspots,
  selected,
  onSelect,
  invite,
  messages,
}: {
  hotspots: readonly PlayerHotspot[];
  selected: PlayerHotspot;
  onSelect: (spot: PlayerHotspot) => void;
  /** The viewer's invite link, for the phone frame's INVITE FRIENDS block. */
  invite: string;
  messages: Messages;
}) {
  const t = messages.community.map;
  const place = t.place.replace("{city}", selected.city).replace("{country}", selected.country);

  // A new place re-deals the readout: the name and the count rise in
  // (`readout-in`), as the leaderboard's rows do on a filter. Keyed on the
  // place so React remounts the two lines and the animation restarts; not on
  // the first place — the Reveal brings the column up. CSS, not GSAP, for the
  // panel's reason: the flight it coincides with keeps the main thread busy
  // and a JS tween started beside it arrived already finished.
  const [firstPlace] = useState(selected.id);
  const redeal = selected.id !== firstPlace;

  return (
    <section className="w-full px-5 pb-[8.5625rem] lg:pl-[11.4%] lg:pr-[12.8%] lg:pb-[13.625rem]">
      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        {/* ---- LOCATION / ACTIVE PLAYERS ---- */}
        <Reveal className="mt-[6.375rem] lg:mt-0 lg:pt-17 lg:pr-8">
          <div key={selected.id}>
            <p className="text-menu-fg font-body text-body">{t.location}</p>
            <p
              data-readout-value
              className={cn(
                "font-display text-menu-fg mt-1.75 text-[3rem] leading-none font-semibold tracking-[-0.07em] uppercase lg:mt-3",
                redeal && "readout-in",
              )}
            >
              {place}
            </p>
            <p className="text-menu-fg font-body text-body-sm mt-[4.4375rem] lg:mt-[3.4375rem]">{t.activePlayers}</p>
            <p
              data-readout-value
              className={cn(
                "font-display text-menu-fg -mt-0.5 text-[2.1875rem] leading-none font-semibold tracking-[-0.055em] lg:mt-1.5",
                redeal && "readout-in [animation-delay:70ms]",
              )}
            >
              {new Intl.NumberFormat("en-NG").format(selected.active)}
            </p>
          </div>
        </Reveal>

        {/* ---- The disc: full-bleed and wider than the screen on a phone, the
            frame's 732 at the right of the copy from lg ---- */}
        <Reveal delay={80} className="order-first -mx-5 lg:order-none lg:mx-0 lg:w-[50.8vw] lg:max-w-[45.75rem]">
          <ActiveMap
            hotspots={hotspots}
            selected={selected}
            onSelect={onSelect}
            messages={messages}
            discClassName="w-[174.7vw] max-w-[45.75rem] lg:w-full"
          />
        </Reveal>

        {/* ---- INVITE FRIENDS: the phone frame's, and only its ---- */}
        <Reveal delay={40} className="lg:hidden">
          <InviteFriends link={invite} messages={messages} className="mt-[4.875rem]" />
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The search pill from the hero's CTA slot: a combobox over the hotspots.
 * Typing filters by city or country; arrows move, Enter chooses, Escape closes.
 */
export function MapSearch({
  hotspots,
  onSelect,
  messages,
  className,
}: {
  hotspots: readonly PlayerHotspot[];
  onSelect: (spot: PlayerHotspot) => void;
  messages: Messages;
  className?: string;
}) {
  const t = messages.community.map;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const matches = q
    ? hotspots.filter((h) => h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q)).slice(0, 6)
    : [];

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const choose = (spot: PlayerHotspot) => {
    onSelect(spot);
    setQuery(t.place.replace("{city}", spot.city).replace("{country}", spot.country));
    setOpen(false);
  };

  return (
    <div ref={root} className={cn("relative w-[calc(100%+0.625rem)] max-w-[22.875rem] shrink-0", className)}>
      <label htmlFor={`${listId}-input`} className="sr-only">
        {t.searchLabel}
      </label>
      <div className="border-disabled-fg focus-within:border-menu-fg flex h-12 items-center rounded-full border pr-5 pl-4 transition-colors duration-150">
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[cursor] ? `${listId}-${matches[cursor].id}` : undefined}
          value={query}
          placeholder={t.searchPlaceholder}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setCursor((c) => Math.min(matches.length - 1, c + 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setCursor((c) => Math.max(0, c - 1));
            } else if (event.key === "Enter" && open && matches[cursor]) {
              event.preventDefault();
              choose(matches[cursor]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="text-menu-fg placeholder:text-menu-fg/55 font-body h-full min-w-0 flex-1 bg-transparent text-[0.875rem] outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <PinGlyph />
      </div>

      {open && q ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t.results}
          className="bg-menu-fg menu-in absolute top-full left-0 z-30 mt-2 w-full origin-top p-2 text-left shadow-lg"
        >
          {matches.length ? (
            matches.map((spot, i) => (
              <li
                key={spot.id}
                id={`${listId}-${spot.id}`}
                role="option"
                aria-selected={i === cursor}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(spot)}
                className={cn(
                  "text-ash font-body flex cursor-pointer items-baseline justify-between gap-4 px-3 py-2 text-[0.875rem] leading-none",
                  i === cursor && "bg-ash/8",
                )}
              >
                <span>{t.place.replace("{city}", spot.city).replace("{country}", spot.country)}</span>
                <span className="text-ash/60 text-[0.75rem]">{spot.active}</span>
              </li>
            ))
          ) : (
            <li className="text-ash/70 font-body px-3 py-2 text-[0.875rem] leading-none">{t.noResults}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

/** The location mark at the search's right, 16 square, drawn: no icon was delivered. */
function PinGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="text-menu-fg/80 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M8 14.5s4.5-4.3 4.5-8A4.5 4.5 0 0 0 3.5 6.5c0 3.7 4.5 8 4.5 8Z" />
      <circle cx="8" cy="6.5" r="1.6" />
    </svg>
  );
}
