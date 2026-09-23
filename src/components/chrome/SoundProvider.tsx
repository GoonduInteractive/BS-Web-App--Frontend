"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useGateEntry } from "@/components/gates/GateEntry";
import { AMBIENCE_VOLUME, FADE_MS, TRACKS, trackFor, type TrackId } from "@/lib/audio";

/**
 * The site's sound layer: one ambient bed, chosen by where the visitor is
 * standing, and one switch that turns it on or off everywhere.
 *
 * ONE PROVIDER, NOT ONE PER BUTTON. The toggle appears twice - the entry
 * screen's and the chrome's - and each used to hold its own `useState`, so the
 * two disagreed and neither played anything. The state lives here now, above
 * both, beside `GateEntryProvider` whose `shown` decides which gate's bed the
 * portal is on.
 *
 * NOTHING IS FETCHED UNTIL THE VISITOR ASKS FOR SOUND. The element carries
 * `preload="none"` and has no `src` at all until the first time sound is turned
 * on: a visitor who never touches the toggle - which is everyone, by default -
 * pays nothing for five audio files on a metered connection. That is also why
 * the beds are one file each and not a sprite.
 *
 * SOUND IS OFF BY DEFAULT AND NEVER AUTOPLAYS, per the accessibility rule.
 * `play()` is only ever called from the click that turns it on, or from a
 * track change while it is already playing - both inside a gesture the visitor
 * made. The preference is deliberately NOT remembered across visits: restoring
 * "on" would either autoplay or show a lie until the visitor touched the page.
 *
 * A CHANGE OF GROUND IS A CROSSFADE, not a cut: the old bed fades out over
 * `FADE_MS`, the new one is swapped in and fades up. Under
 * `prefers-reduced-motion` it still fades - this is sound, not movement, and a
 * hard cut is the harsher of the two.
 */
const SoundContext = createContext<{ on: boolean; toggle: () => void } | null>(null);

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside SoundProvider");
  return ctx;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { shown } = useGateEntry();
  const [on, setOn] = useState(false);

  const audio = useRef<HTMLAudioElement>(null);
  const fade = useRef<number | null>(null);
  /** The bed currently loaded, so a re-render that resolves the same one does nothing. */
  const loaded = useRef<TrackId | null>(null);

  const track = trackFor(pathname, shown);

  /** Ramp the volume, then hand back so the caller can swap or stop. */
  const rampTo = useCallback((target: number, done?: () => void) => {
    const el = audio.current;
    if (!el) return;
    if (fade.current) window.clearInterval(fade.current);
    const step = 40;
    const from = el.volume;
    const started = performance.now();
    fade.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - started) / FADE_MS);
      el.volume = from + (target - from) * t;
      if (t < 1) return;
      window.clearInterval(fade.current!);
      fade.current = null;
      done?.();
    }, step);
  }, []);

  const toggle = useCallback(() => setOn((v) => !v), []);

  /**
   * A bed that will not play turns the switch back off rather than leaving the
   * bell ringing over silence - a missing file (which is `dev` today, since
   * the placeholder beds are deliberately not in the repo) or a browser that
   * refused. The element's `error` is attached here rather than through JSX:
   * React's `onError` prop does not fire for a media element whose source
   * fails to load, which cost a round of testing to find.
   */
  const giveUp = useCallback(() => {
    loaded.current = null;
    setOn(false);
  }, []);

  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    el.addEventListener("error", giveUp);
    return () => el.removeEventListener("error", giveUp);
  }, [giveUp]);

  // Turning it on and off. The `play()` here runs inside the click that set
  // `on`, which is the gesture browsers require.
  useEffect(() => {
    const el = audio.current;
    if (!el) return;

    if (!on) {
      if (!loaded.current) return;
      rampTo(0, () => el.pause());
      return;
    }

    if (loaded.current !== track) {
      el.src = TRACKS[track];
      loaded.current = track;
    }
    el.volume = 0;
    void el.play().then(() => rampTo(AMBIENCE_VOLUME), giveUp);
  }, [on, track, rampTo, giveUp]);

  // Walking from one ground to another while the sound is on.
  useEffect(() => {
    const el = audio.current;
    if (!el || !on || loaded.current === track) return;
    rampTo(0, () => {
      el.src = TRACKS[track];
      loaded.current = track;
      void el.play().then(() => rampTo(AMBIENCE_VOLUME), giveUp);
    });
  }, [track, on, rampTo, giveUp]);

  useEffect(() => () => {
    if (fade.current) window.clearInterval(fade.current);
  }, []);

  const value = useMemo(() => ({ on, toggle }), [on, toggle]);

  return (
    <SoundContext.Provider value={value}>
      {children}
      {/* No `src` until the visitor asks; `loop` because a bed has no end. */}
      <audio ref={audio} loop preload="none" aria-hidden />
    </SoundContext.Provider>
  );
}
