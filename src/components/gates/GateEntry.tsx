"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { usePageTransition } from "@/components/transition/TransitionProvider";

/**
 * Whether the visitor has passed through the gate into the page behind it.
 *
 * A GATE IS A DOOR, NOT A TALL HERO. You cannot scroll from the gate down into
 * the page: while the gate is up it is the only thing in the document, so there
 * is nothing to scroll to. The CTA tears, and the page is what the tear opens
 * onto — the first thing you see, at the top of the screen. Going back closes
 * the door again.
 *
 * WHY THE STATE LIVES THIS HIGH
 *
 * Two things react to it and they are on opposite sides of the tree: the gate
 * page (`GateView`, under `children`) and the gate rail (under `SiteChrome`).
 * The provider is mounted in `layout.tsx` so it is an ancestor of both. It also
 * has to sit INSIDE TransitionProvider, because entering plays the tear.
 *
 * IT IS NOT IN THE URL, deliberately. The gate and the page it opens are one
 * route (`/the-game` is both Ọnụ Ụzọ 1 and The Game), which is what keeps the
 * page's content in the statically generated HTML for crawlers and keeps one
 * canonical URL per gate. The cost is that the door does not survive a reload
 * or a share — arriving at `/the-game` always starts at the gate, which is the
 * behaviour the gate is for.
 */
const GateEntryContext = createContext<{
  entered: boolean;
  enter: () => void;
  leave: () => void;
  /**
   * Mark a route as already open, with NO transition of any kind.
   *
   * The gate pull-up needs this and nothing else does. `enter` and `leave` both
   * go through the tear, because a click across the gate boundary is a jump and
   * the tear is what a jump looks like. The pull-up is the opposite: the visitor
   * has already travelled the distance by scrolling, and the panel they pulled
   * up IS the destination, so anything played on arrival would be a transition
   * to somewhere they can already see.
   *
   * It takes the route rather than assuming the current one, because it is
   * called BEFORE the push lands. `entered` is derived from
   * `openedRoute === pathname`, so seeding the incoming path means the new route
   * renders its page face on its first paint instead of flashing its gate.
   */
  openRoute: (route: string) => void;
} | null>(null);

export function useGateEntry() {
  const ctx = useContext(GateEntryContext);
  if (!ctx) throw new Error("useGateEntry must be used inside GateEntryProvider");
  return ctx;
}

export function GateEntryProvider({ children }: { children: ReactNode }) {
  const { reveal } = usePageTransition();
  const pathname = usePathname();

  /**
   * WHICH GATE IS OPEN, not whether one is — and that is what makes every gate
   * start closed for free.
   *
   * A plain boolean would have to be reset on every route change, which means an
   * effect that calls setState, which means a second render on every navigation
   * for a value that was already knowable. Storing the route instead makes
   * `entered` derived: arriving anywhere new cannot match, so the next gate is
   * closed the moment its pathname lands.
   */
  const [openedRoute, setOpenedRoute] = useState<string | null>(null);
  const entered = openedRoute === pathname;

  /**
   * Both directions are the same move: tear, swap under full cover, reveal.
   *
   * The scroll reset is not optional in either direction. Leaving from halfway
   * down the page has to land on the gate, not on the middle of nothing; and
   * `instant` is required because a smooth scroll would still be travelling
   * when the tear opened.
   */
  const swap = useCallback(
    (next: string | null) => {
      reveal(() => {
        setOpenedRoute(next);
        window.scrollTo({ top: 0, behavior: "instant" });
      });
    },
    [reveal],
  );

  const enter = useCallback(() => swap(pathname), [swap, pathname]);
  const leave = useCallback(() => swap(null), [swap]);
  const openRoute = useCallback((route: string) => setOpenedRoute(route), []);

  return (
    <GateEntryContext.Provider value={{ entered, enter, leave, openRoute }}>
      {children}
    </GateEntryContext.Provider>
  );
}
