"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { CompetitionTabs, type CompetitionView } from "@/components/competition/CompetitionTabs";
import { TornDivider } from "@/components/ui/TornDivider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Messages } from "@/lib/utils/messages";

/**
 * The torn edge, the tabs, and the two panels they switch between.
 *
 * The tournaments panel is the page the Competition frame draws; the
 * leaderboard panel is `leaderboard.png`. Both are Server Components rendered by
 * the page and handed here as nodes, so this client component holds one piece
 * of state and nothing about either panel's content.
 *
 * BOTH PANELS ARE IN THE DOCUMENT, the inactive one `hidden` — the same
 * arrangement `GateView` uses for a gate and its page. Static generation
 * ships both, so a crawler reads the leaderboard too; `hidden` takes the other
 * out of layout without taking it out of the tree, and every `Reveal` inside
 * it fires when it is shown.
 *
 * The tear used to be the FeaturedTournament section's first child, because it
 * is the top of what follows the hero. With two panels it heads both, so it
 * moved up one level with the tabs; nothing about its geometry changed.
 *
 * SWITCHING SETTLES THE NEW PANEL IN — a short rise and fade on the panel
 * itself, every time, because the `Reveal`s inside it fire once and would leave
 * the second switch abrupt. GSAP is on this page already (the gate curtain
 * loads it), so the import is a cache hit; nothing runs on the first render or
 * under reduced motion.
 */
export function CompetitionPanels({
  messages,
  tournaments,
  leaderboard,
}: {
  messages: Messages;
  tournaments: ReactNode;
  leaderboard: ReactNode;
}) {
  const [view, setView] = useState<CompetitionView>("tournaments");
  const panels = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    const panel = panels.current?.querySelector<HTMLElement>(`#competition-panel-${view}`);
    if (!panel) return;
    let cancelled = false;
    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      gsap.fromTo(
        panel,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", clearProps: "opacity,transform", overwrite: "auto" },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [view, reduced]);

  return (
    <>
      <TornDivider edge="top" seed={6104} className="text-roster-top relative z-20 -mt-14" />
      <CompetitionTabs messages={messages} active={view} onChange={setView} />

      <div ref={panels}>
        <div
          id="competition-panel-tournaments"
          role="tabpanel"
          aria-labelledby="competition-tab-tournaments"
          hidden={view !== "tournaments"}
        >
          {tournaments}
        </div>
        <div
          id="competition-panel-leaderboard"
          role="tabpanel"
          aria-labelledby="competition-tab-leaderboard"
          hidden={view !== "leaderboard"}
        >
          {leaderboard}
        </div>
      </div>
    </>
  );
}
