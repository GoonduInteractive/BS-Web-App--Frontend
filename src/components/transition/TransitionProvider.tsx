"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Tear } from "@/lib/animation/tear";
import { TransitionOverlay } from "./TransitionOverlay";
import { ALL_TEAR_SOURCES } from "./tear-variants";

type Phase = "idle" | "closing" | "covered" | "opening";

type PageTransition = {
  /** Play the tear, change route, reveal the new page. */
  navigate: (href: string) => void;
  /**
   * Play the tear over a change that is NOT a route change.
   *
   * `commit` runs while the screen is fully covered, so whatever it does - a
   * scroll jump, a state swap - is never seen happening. The gate CTA uses this:
   * a gate and the page it opens onto share one route, so there is no href to
   * push, but the passage between them still has to be the tear.
   */
  reveal: (commit: () => void) => void;
  /**
   * THE SHARED NAVIGATION LOCK.
   *
   * The gate pull-up is a second transition that owns the screen, and the two
   * must never run together: a visitor who scrolls into the seam while a tear is
   * mid-flight has to get one transition, not both.
   *
   * `claim` hands the screen to a non-tear transition and returns a release
   * function, or null when the tear already holds it. `busy` is the read the
   * pull-up uses to keep itself disabled while a tear is running.
   */
  claim: () => (() => void) | null;
  busy: () => boolean;
};

/** Named to avoid collision with React's own useTransition. */
const PageTransitionContext = createContext<PageTransition | null>(null);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error("usePageTransition must be used inside TransitionProvider");
  return ctx;
}

/** If the open never fires the screen would stay red. This should never trigger. */
const FAILSAFE_MS = 3000;

/**
 * Minimum beat at full cover before the reveal starts.
 *
 * The hold used to be whatever the route change happened to take. Once the close
 * was lengthened the route was already resolved by the time it finished, and the
 * measured hold collapsed to 72ms - the covered moment stopped registering and
 * the close ran straight into the open. This floors it so the wipe has a beat.
 */
const HOLD_MIN_MS = 220;

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);

  const phase = useRef<Phase>("idle");
  // The wipe in flight: its close, and how it opens (the two flows differ).
  const timeline = useRef<Tear | null>(null);
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coveredAt = useRef(0);
  const [active, setActive] = useState(false);
  const [isPending, startNavTransition] = useTransition();

  const panels = useCallback(
    () => ({ left: leftRef.current, right: rightRef.current, top: topRef.current, side: sideRef.current }),
    [],
  );

  /**
   * GSAP is dynamically imported so its ~27KB gzipped stays out of the initial
   * bundle - this is a content site on metered Nigerian data and the wipe only
   * matters once someone interacts. The idle warm below removes the cost of that
   * fetch from the first click.
   */
  const loadTear = () => import("@/lib/animation/tear");

  // Park the panels as soon as they mount, then warm on idle: fetch the
  // animation chunk, and decode each tear so its feDisplacementMap is rasterised
  // during idle rather than at the moment of the first click.
  useEffect(() => {
    let cancelled = false;
    const warm = async () => {
      const tear = await loadTear();
      if (cancelled) return;
      tear.resetPanels(panels());
      await Promise.all(
        ALL_TEAR_SOURCES.map(async (src) => {
          const img = new Image();
          img.src = src;
          try {
            await img.decode();
          } catch {
            /* a failed warm is not a failure; the transition still works */
          }
        }),
      );
    };
    const idle = window.requestIdleCallback?.(() => void warm()) ?? window.setTimeout(warm, 200);
    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(idle as number);
    };
  }, [panels]);

  /** Reveal: the classic flow reverses along its seam, the sweep passes through. */
  const openTear = useCallback(async () => {
    // Both the pathname effect and the popstate handler can reach this, so it
    // has to be safe to call twice.
    if (phase.current !== "covered") return;
    if (failsafe.current) clearTimeout(failsafe.current);
    phase.current = "opening";

    // Hold the cover for a beat. Applies to clicks and to back/forward alike, so
    // neither path needs its own timer.
    const held = performance.now() - coveredAt.current;
    if (held < HOLD_MIN_MS) {
      await new Promise((resolve) => setTimeout(resolve, HOLD_MIN_MS - held));
    }

    const done = () => {
      phase.current = "idle";
      setActive(false);
    };

    try {
      const tear = await loadTear();

      // Let the incoming route actually PAINT before the open starts. React
      // reports the navigation committed before the browser has painted it, and
      // that commit blocks the main thread long enough that GSAP - which is
      // time-based, not frame-based - catches up by jumping. Measured without
      // this: the reveal began already 30% travelled, so a third of the new page
      // snapped into view instead of being revealed.
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)));
      });

      const tl = timeline.current;
      if (!tl) {
        tear.resetPanels(panels());
        done();
        return;
      }
      tl.open(() => {
        timeline.current = null;
        done();
      });
    } catch {
      done();
    }
  }, [panels]);

  // The open waits for the navigation to commit. React's useTransition means red
  // simply holds while the route resolves, which is exactly the required "do not
  // open onto an empty page" behaviour, for free.
  useEffect(() => {
    if (phase.current !== "covered" || isPending) return;
    void openTear();
  }, [pathname, isPending, openTear]);

  /**
   * Held while the pull-up owns the screen. Kept separate from `phase`, which
   * describes the TEAR's own state machine - conflating them would have a
   * pull-up driving the tear overlay.
   */
  const claimed = useRef(false);

  const busy = useCallback(() => phase.current !== "idle" || claimed.current, []);

  const claim = useCallback(() => {
    if (phase.current !== "idle" || claimed.current) return null;
    claimed.current = true;
    return () => {
      claimed.current = false;
    };
  }, []);

  const navigate = useCallback(
    (href: string) => {
      // A claim held by the pull-up swallows link clicks: past its threshold the
      // route is already changing, and a tear on top would be a second one.
      if (claimed.current) return;
      if (phase.current !== "idle") return; // swallow rapid repeat clicks
      if (href === pathname) return; // same route would never fire the open

      phase.current = "closing";
      setActive(true);

      void (async () => {
        try {
          const tear = await loadTear();
          const tl = tear.createTear(panels(), { reduced });
          timeline.current = tl;
          await new Promise((resolve) => {
            tl.close.eventCallback("onComplete", () => resolve(null));
            tl.close.timeScale(1).play();
          });
        } catch {
          // Navigation is the priority, the animation is decoration.
          phase.current = "idle";
          setActive(false);
          router.push(href);
          return;
        }

        phase.current = "covered";
        coveredAt.current = performance.now();
        failsafe.current = setTimeout(() => void openTear(), FAILSAFE_MS);
        startNavTransition(() => router.push(href));
      })();
    },
    [openTear, panels, pathname, reduced, router],
  );

  /**
   * Same-route tear. Close, run `commit` under full cover, reveal.
   *
   * It cannot lean on the pathname effect the way `navigate` does - the route
   * never changes, so that effect never fires - so it calls `openTear` itself
   * once the commit is in. The failsafe is armed before `commit` runs, because a
   * throw inside it must not leave the screen red.
   */
  const reveal = useCallback(
    (commit: () => void) => {
      if (claimed.current) return;
      if (phase.current !== "idle") return; // swallow rapid repeat clicks

      phase.current = "closing";
      setActive(true);

      void (async () => {
        try {
          const tear = await loadTear();
          const tl = tear.createTear(panels(), { reduced });
          timeline.current = tl;
          await new Promise((resolve) => {
            tl.close.eventCallback("onComplete", () => resolve(null));
            tl.close.timeScale(1).play();
          });
        } catch {
          // The change is the priority, the animation is decoration.
          phase.current = "idle";
          setActive(false);
          commit();
          return;
        }

        phase.current = "covered";
        coveredAt.current = performance.now();
        failsafe.current = setTimeout(() => void openTear(), FAILSAFE_MS);
        commit();
        void openTear();
      })();
    },
    [openTear, panels, reduced],
  );

  /**
   * Back and forward play the transition too, per Design.
   *
   * popstate cannot be cancelled and the browser has already begun rendering the
   * new route by the time it fires, so playing the close here would flash the
   * incoming page before covering it. Instead the overlay snaps to fully covered
   * immediately and the pathname effect reveals it - the user sees the tear open
   * onto the page they navigated back to, with no flash.
   */
  useEffect(() => {
    const onPopState = () => {
      if (phase.current !== "idle") return;
      void (async () => {
        const tear = await loadTear();
        const tl = tear.createTear(panels(), { reduced });
        tl.coverNow();
        timeline.current = tl;
        phase.current = "covered";
        coveredAt.current = performance.now();
        setActive(true);
        void openTear();
      })();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [openTear, panels, reduced]);

  // Delegated link handling, so any future <Link> gets the wipe for free.
  // Modified clicks, new-tab, downloads and external hrefs pass straight through.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href?.startsWith("/")) return; // external, hash and mailto are not ours
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      event.preventDefault();
      // Stop the event before React's root listener sees it. Without this,
      // next/link's own onClick still runs and pushes the route itself.
      event.stopPropagation();
      navigate(href);
    };

    // CAPTURE PHASE, and that is load-bearing rather than a style choice.
    //
    // React attaches its handlers to the root container, which is BELOW
    // document, so a bubble-phase listener here runs after next/link has already
    // navigated - the route changed and the tear never played. Every <Link> on
    // the site silently skipped the transition; only EnterButton worked, because
    // it calls navigate() directly rather than going through a link.
    //
    // Capturing on document runs before the root container is reached, so the
    // click is ours to cancel first. This is what lets the rail, the scroll cue
    // and the menu get the tear "for free" from being real links.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return (
    <PageTransitionContext.Provider value={{ navigate, reveal, claim, busy }}>
      {children}
      <TransitionOverlay leftRef={leftRef} rightRef={rightRef} topRef={topRef} sideRef={sideRef} active={active} />
    </PageTransitionContext.Provider>
  );
}
