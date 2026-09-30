"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { usePageTransition } from "@/components/transition/TransitionProvider";
import type { GateId } from "@/lib/gates";

/**
 * Which gate the portal is showing.
 *
 * THE GATES LIVE ON THE HOME ROUTE; THE PAGES HAVE THE URLS. Per the human
 * (2026-09-14): "when on any gate the link should be `/en/` … you only see
 * `/en/community` when you enter the main page of a specific gate." So `/en`
 * is the portal - the entry screen first, then whichever Ọnụ Ụzọ the visitor
 * is standing at - and `/en/the-game`, `/en/characters`, `/en/community`,
 * `/en/competition` are the pages behind the doors, rendered as pages. A gate's
 * CTA is a real link to its page; BACK TO ỤZỌ, the scroll cues and the rail
 * come back here and say which door to stand at.
 *
 * WHY THE STATE LIVES THIS HIGH. Three things read it from opposite sides of
 * the tree - the portal (under `children`), the rail and the chrome (under
 * `SiteChrome`) - and the provider is mounted in `layout.tsx` so it is an
 * ancestor of all of them and SURVIVES NAVIGATION: a page can name the gate
 * before pushing the home route, and the portal paints that gate on its first
 * render. It sits inside TransitionProvider because every move plays the tear.
 *
 * IT IS NOT IN THE URL, deliberately. Four doors at one address is what the
 * human asked for, and the pages keep one canonical URL each with their
 * content in the static HTML. The cost: a cold load of `/en` is always the
 * entry screen, and a shared page link opens straight onto the page - which
 * is what a page link should do.
 */
const GateEntryContext = createContext<{
  /** The gate the portal shows, or null for the entry screen. */
  shown: GateId | null;
  /**
   * Stand at a gate, through the tear. On the portal it swaps the face in
   * place; from anywhere else it names the gate and navigates home, so the
   * portal opens on it.
   */
  showGate: (id: GateId) => void;
  /**
   * Name the gate with NO transition - the pull-up's move. The visitor has
   * already travelled the distance by scrolling and the sheet they pulled up
   * IS the gate; the curtain pushes the home route itself, under cover.
   */
  seedGate: (id: GateId) => void;
  /**
   * A SCROLL move to the next or previous door (`dir` 1 or -1): the gate rise,
   * not the tear. Scrolling moves through the sequence, clicking jumps across
   * it - two gestures, two transitions. Off the portal it falls back to
   * `showGate`.
   */
  stepGate: (id: GateId, dir: 1 | -1) => void;
  /** The rise in progress, for the portal to play; null at rest. */
  step: GateStep | null;
  /** The portal calls this when the rise has landed. */
  endStep: () => void;
} | null>(null);

/** One scroll move between doors: where from, where to, and which way. */
export type GateStep = { from: GateId; to: GateId; dir: 1 | -1 };

export function useGateEntry() {
  const ctx = useContext(GateEntryContext);
  if (!ctx) throw new Error("useGateEntry must be used inside GateEntryProvider");
  return ctx;
}

/** The portal's path for the pathname's locale: `/en`, `/ig`. */
export function homeHref(pathname: string): string {
  return `/${pathname.split("/").filter(Boolean)[0] ?? "en"}`;
}

export function GateEntryProvider({ children }: { children: ReactNode }) {
  const { reveal, navigate, claim } = usePageTransition();
  const pathname = usePathname();
  const [shown, setShown] = useState<GateId | null>(null);
  const [step, setStep] = useState<GateStep | null>(null);
  const releaseStep = useRef<(() => void) | null>(null);

  const home = homeHref(pathname);
  const atHome = pathname === home;

  /**
   * Both moves are the same shape: tear, change under full cover, reveal. On
   * the portal there is no route to change, so `reveal` runs the swap itself;
   * elsewhere the gate is named first and `navigate` plays the tear around
   * the push. The scroll reset matters on the portal too - a gate is one
   * viewport tall and must open at its top.
   */
  const showGate = useCallback(
    (id: GateId) => {
      if (atHome) {
        reveal(() => {
          setShown(id);
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        return;
      }
      setShown(id);
      navigate(home);
    },
    [atHome, home, navigate, reveal],
  );

  const seedGate = useCallback((id: GateId) => setShown(id), []);

  const endStep = useCallback(() => {
    setStep(null);
    releaseStep.current?.();
    releaseStep.current = null;
  }, []);

  /**
   * The rise holds the same lock the pull-up does (`claim`), so the tear can
   * never start under it and a second scroll cannot stack another rise. The
   * gate is named at once: the rail lights the destination as the new door
   * starts to rise, which is the "where am I going" the tear never said.
   * Under reduced motion the door simply changes.
   */
  const stepGate = useCallback(
    (id: GateId, dir: 1 | -1) => {
      if (!atHome || !shown) {
        showGate(id);
        return;
      }
      if (id === shown) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setShown(id);
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
      const release = claim();
      if (!release) return;
      releaseStep.current = release;
      window.scrollTo({ top: 0, behavior: "instant" });
      setStep({ from: shown, to: id, dir });
      setShown(id);
    },
    [atHome, shown, showGate, claim],
  );

  // Leaving the portal mid-rise must not strand the lock.
  useEffect(() => {
    if (!atHome && releaseStep.current) endStep();
  }, [atHome, endStep]);

  const value = useMemo(
    () => ({ shown, showGate, seedGate, stepGate, step, endStep }),
    [shown, showGate, seedGate, stepGate, step, endStep],
  );

  return <GateEntryContext.Provider value={value}>{children}</GateEntryContext.Provider>;
}
