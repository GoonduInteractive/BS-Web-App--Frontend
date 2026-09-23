"use client";

import { useRef, useState } from "react";

import { NsibidiField } from "@/components/chrome/NsibidiField";
import { CommunityWall, type WallView } from "@/components/community/CommunityWall";
import { FeedbackDialog } from "@/components/community/FeedbackDialog";
import { MapPanel, MapSearch } from "@/components/community/MapPanel";
import { GateReturn } from "@/components/gates/GateReturn";
import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import { PanelTabs } from "@/components/ui/PanelTabs";
import { WALL } from "@/lib/api/community";
import { placeNote } from "@/lib/community/place";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";
import type { CommunityNote } from "@/types/community";
import type { PlayerHotspot } from "@/types/players";

export type CommunityView = "wall" | "map";
/** Tab order - a swap slides towards the tab you chose. */
const VIEWS: readonly CommunityView[] = ["wall", "map"];

/**
 * The Community page behind gate 3: the hero, the two tabs, and the wall.
 * Figma: `05-community/Community Wall.png` (1440 x 1810) and `MOBILE-WALL.png`
 * (360 x 2267). One client component because the hero's CTA, the sheet it
 * opens and the wall share one piece of state - the notes, which a submitted
 * sheet adds to.
 *
 * THE HERO IS THE ENTRY SCREEN'S GROUND, per the human: the same `bg-entry`
 * gradient and the same drifting `NsibidiField` glyph rows. No plate.
 *
 * WHAT THE FRAME MEASURES, at 1440:
 *
 *   hero     0..657, the wall from 657
 *   chip     93..223 x 227..256 - the Game and Competition heroes' chip exactly
 *   tabs     centred, label caps at 225; a 6px marker, the underline 550..698
 *   title    ink 450..993, cap 63 at 307 - the hero title token
 *   body     two centred lines, caps 403 and 428, 519 wide
 *   CTA      red 601..838 x 499..553, brackets at 573 and 856
 *
 * Phone (360): chip 20..149 x 136..164; tabs at 225 with the active one at the
 * left edge and the other at the right; title two lines at a 54 pitch from cap
 * 350; body four lines from 471; CTA red 61..298 x 617..671; the wall 760..1631.
 *
 * TWO TABS, ONE HERO. `Active player map.png` keeps the chip, the tabs and the
 * body and swaps the title (ACTIVE PLAYER MAP) and the slot under the body:
 * SHARE YOUR THOUGHTS becomes the location search. The body copy under the
 * map title is the wall's own sentence in the frame ("Welcome to our Community
 * Wall! …") - transcribed as drawn and FLAGGED as a likely comp slip. Both
 * panels are in the document, the inactive one `hidden`, as the Competition
 * page does; the map's chunk loads only when its tab is chosen.
 */
export function CommunityBoard({
  notes: initial,
  hotspots,
  invite,
  messages,
  you,
}: {
  notes: readonly CommunityNote[];
  hotspots: readonly PlayerHotspot[];
  /** The viewer's invite link, for the map's INVITE FRIENDS block. */
  invite: string;
  messages: Messages;
  /** The display name a submitted note is signed with. */
  you: string;
}) {
  const t = messages.community;
  const [view, setView] = useState<CommunityView>("wall");
  // The frame opens on Lagos; a pin or a search moves it.
  const [spot, setSpot] = useState<PlayerHotspot>(hotspots[0]);
  const [notes, setNotes] = useState<readonly CommunityNote[]>(initial);
  const [writing, setWriting] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const wallView = useRef<WallView>({ x: WALL.origin.x, y: WALL.origin.y, w: 1440, h: 872 });

  // A TAB SWITCH IS A SWAP, per the human ("a cool animation that seems like a
  // swap"): the panel you were on slides out one way while the new one slides
  // in from the other, the underline travels between the tabs (`TabSlider`)
  // and the title and the control under it fade to their counterparts. The
  // outgoing panel stays in the document, absolute over the incoming one, for
  // the length of its exit (`swap-out-*`), then goes `hidden`; the incoming is
  // in flow, so the page's height is the new panel's from the first frame.
  // Direction follows the tab order. CSS, not GSAP, deliberately: the map's
  // chunk parses on the main thread the moment its panel shows, and a JS tween
  // created just before that block came out the other side already finished;
  // composited opacity/transform animations keep moving through it.
  //
  // THE WALL IS NEVER display:none. Taking 161 torn cards out of layout and
  // back cost ~480ms of relayout (every TornPanel re-measuring its filter) on
  // the way back in, which swallowed the swap before its first frame. Off
  // duty it is `visibility: hidden` and absolute instead - out of flow, out of
  // the accessibility tree and the tab order, but laid out - so coming back
  // is a visibility flip and the animation runs from its first frame.
  // Each side keeps its class until ITS OWN animation ends: clearing both on
  // the shorter exit cut the entrance a third short.
  const [leaving, setLeaving] = useState<CommunityView | null>(null);
  const [entering, setEntering] = useState<CommunityView | null>(null);
  const [forward, setForward] = useState(true);
  const show = (next: CommunityView) => {
    if (next === view) return;
    setForward(VIEWS.indexOf(next) > VIEWS.indexOf(view));
    setLeaving(view);
    setEntering(next);
    setView(next);
  };
  const swap = (id: CommunityView) =>
    cn(
      entering === id && (forward ? "swap-in-right" : "swap-in-left"),
      leaving === id && cn("pointer-events-none absolute inset-x-0 top-0 z-10", forward ? "swap-out-left" : "swap-out-right"),
    );
  const settle = (id: CommunityView) => (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (leaving === id) setLeaving(null);
    if (entering === id) setEntering(null);
  };
  const wallParked = view !== "wall" && leaving !== "wall";

  // A new note lands in the middle of what the visitor is looking at, on
  // cream, and the cards already there are pushed aside to make room for it
  // (`placeNote`) - a note never covers another. Per the human.
  const post = (body: string) => {
    const id = `you-${Date.now()}`;
    setNotes((current) =>
      placeNote(
        current,
        { id, author: you, body, likes: 0, postedAt: new Date().toISOString(), tint: "cream" },
        wallView.current,
        WALL,
      ),
    );
    setFresh(id);
    setWriting(false);
  };

  return (
    <>
      <section className="bg-entry relative overflow-hidden">
        <NsibidiField />

        {/* The hero's foot is the panel's: the wall starts 89 under the CTA on
            the phone frame and 104 at 1440; the map's disc 70 under the pill
            and 118. */}
        <div
          className={cn(
            "relative z-10 mx-auto flex w-full flex-col px-5 pt-34 lg:px-27 lg:pt-56.75",
            view === "wall" ? "pb-22 lg:pb-25.5" : "pb-[4.125rem] lg:pb-[7.125rem]",
          )}
        >
          <Reveal className="self-start lg:-ml-4">
            <GateReturn label={t.backToGate} />
          </Reveal>

          {/* The tabs: centred on the desktop frame, one at each edge on the
              phone frame, 61 under the chip's foot on both. */}
          {/* Pulled up onto the chip's row at lg, so the row-wide boxes must not
              take the chip's clicks: only the tabs themselves are hit-testable. */}
          <Reveal delay={40} as="div" className="mt-13.5 lg:-mt-10.5 lg:pointer-events-none">
            <PanelTabs
              name="community"
              label={t.tabs.wall}
              tabs={[
                { key: "wall", label: t.tabs.wall },
                { key: "map", label: t.tabs.map },
              ]}
              active={view}
              onChange={show}
              className="-mx-2.5 justify-between gap-[1.875rem] lg:mx-0 lg:justify-center lg:*:pointer-events-auto"
            />
          </Reveal>

          {/* Keyed on the view so the title and the control below re-enter
              with the Reveal's own rise when the tab changes. */}
          <Reveal
            key={`title-${view}`}
            as="h1"
            delay={80}
            className="font-display text-menu-fg text-game-hero mt-22 text-center font-semibold tracking-[-0.058em] uppercase lg:mt-[3.125rem]"
          >
            {view === "wall" ? t.hero.title : t.map.title}
          </Reveal>

          <Reveal delay={120} className="mx-auto mt-3.75 max-w-[33.5rem] lg:mt-4.5">
            <p className="text-menu-fg font-body text-body text-center">{t.hero.body}</p>
          </Reveal>

          {/* The slot under the body: the wall's CTA, or the map's search - the
              frame puts the 48-tall pill exactly where the 55-tall button was. */}
          <Reveal key={`slot-${view}`} delay={160} className="mt-12 flex justify-center lg:mt-12.5">
            {view === "wall" ? (
              <BracketButton onClick={() => setWriting(true)} className="px-5 py-4.75 leading-none tracking-normal">
                {t.hero.cta}
              </BracketButton>
            ) : (
              <MapSearch hotspots={hotspots} onSelect={setSpot} messages={messages} className="my-1" />
            )}
          </Reveal>
        </div>
      </section>

      <div className="relative overflow-hidden">
        <div
          id="community-panel-wall"
          role="tabpanel"
          aria-labelledby="community-tab-wall"
          aria-hidden={wallParked || undefined}
          className={cn(wallParked && "pointer-events-none invisible absolute inset-x-0 top-0", swap("wall"))}
          onAnimationEnd={settle("wall")}
        >
          <CommunityWall notes={notes} fresh={fresh} viewRef={wallView} messages={messages} className="h-[54.5rem]" />
        </div>
        <div
          id="community-panel-map"
          role="tabpanel"
          aria-labelledby="community-tab-map"
          hidden={view !== "map" && leaving !== "map"}
          className={cn("bg-roster", swap("map"))}
          onAnimationEnd={settle("map")}
        >
          {view === "map" || leaving === "map" ? (
            <MapPanel hotspots={hotspots} selected={spot} onSelect={setSpot} invite={invite} messages={messages} />
          ) : null}
        </div>
      </div>

      <FeedbackDialog open={writing} onClose={() => setWriting(false)} onSubmit={post} messages={messages} />
    </>
  );
}
