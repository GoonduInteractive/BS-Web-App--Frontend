"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useGateEntry } from "@/components/gates/GateEntry";
import { BED, FADE_MS, LAYERS, VOLUME, layerFor } from "@/lib/audio";
import { type GateId } from "@/lib/gates";

/**
 * The site's sound: one background bed that runs under every page, a gate's
 * own track laid over it while the visitor is in that gate (see `lib/audio`),
 * and one switch that turns it all on or off everywhere.
 *
 * ONE PROVIDER, NOT ONE PER BUTTON. The toggle appears twice - the entry
 * screen's and the chrome's - and each used to hold its own `useState`, so the
 * two disagreed and neither played anything. The state lives here now, above
 * both, beside `GateEntryProvider` whose `shown` decides which gate the portal
 * is on.
 *
 * NOTHING IS FETCHED UNTIL THE VISITOR ASKS FOR SOUND. The elements carry
 * `preload="none"` and have no `src` at all until the first time sound is
 * turned on: a visitor who never touches the toggle - which is everyone, by
 * default - pays nothing for the tracks on a metered connection. A gate's track
 * is only fetched the first time the visitor stands in that gate with sound on.
 *
 * SOUND IS OFF BY DEFAULT AND NEVER AUTOPLAYS, per the accessibility rule.
 * `play()` is only ever called from the click that turns it on, or from
 * walking into a gate while it is already playing - after a gesture the
 * visitor made. The preference is deliberately NOT remembered across visits:
 * restoring "on" would either autoplay or show a lie until the visitor touched
 * the page.
 *
 * THE BED NEVER STOPS FOR NAVIGATION. Only the gate layer moves: walking into
 * a gate fades its track up over the bed, leaving fades it out, and going gate
 * to gate fades one out before the next comes up, each over `FADE_MS`. Under
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
  /** Read inside `play()` callbacks, which can resolve after the switch moved. */
  const onRef = useRef(false);

  const bed = useRef<HTMLAudioElement>(null);
  const bedFade = useRef<number | null>(null);
  const layer = useRef<HTMLAudioElement>(null);
  const layerFade = useRef<number | null>(null);
  /** The gate track loaded into `layer`, so coming back to it does not refetch. */
  const layerLoaded = useRef<GateId | null>(null);
  /** The gate track playing or fading up - what the layer is "on". */
  const layerPlaying = useRef<GateId | null>(null);

  const gate = layerFor(pathname, shown);

  /** Ramp one element's volume, then hand back so the caller can swap or stop. */
  const rampTo = useCallback(
    (el: HTMLAudioElement, timer: { current: number | null }, target: number, done?: () => void) => {
      if (timer.current) window.clearInterval(timer.current);
      const from = el.volume;
      const started = performance.now();
      timer.current = window.setInterval(() => {
        const t = Math.min(1, (performance.now() - started) / FADE_MS);
        el.volume = from + (target - from) * t;
        if (t < 1) return;
        window.clearInterval(timer.current!);
        timer.current = null;
        done?.();
      }, 40);
    },
    [],
  );

  const toggle = useCallback(() => setOn((v) => !v), []);

  /**
   * A bed that will not play turns the switch back off rather than leaving the
   * bell ringing over silence - a missing file or a browser that refused. A
   * gate track that will not play is only dropped: the bed carries on. The
   * `error` listeners are attached here rather than through JSX: React's
   * `onError` prop does not fire for a media element whose source fails to
   * load, which cost a round of testing to find.
   */
  const giveUp = useCallback(() => setOn(false), []);
  const dropLayer = useCallback(() => {
    layerLoaded.current = null;
    layerPlaying.current = null;
  }, []);

  useEffect(() => {
    const b = bed.current;
    const l = layer.current;
    if (!b || !l) return;
    b.addEventListener("error", giveUp);
    l.addEventListener("error", dropLayer);
    return () => {
      b.removeEventListener("error", giveUp);
      l.removeEventListener("error", dropLayer);
    };
  }, [giveUp, dropLayer]);

  // The bed: on and off with the switch, and nothing else. The `play()` here
  // runs inside the click that set `on`, which is the gesture browsers require.
  useEffect(() => {
    onRef.current = on;
    const el = bed.current;
    if (!el) return;

    if (!on) {
      if (!el.getAttribute("src")) return;
      rampTo(el, bedFade, 0, () => el.pause());
      return;
    }

    if (!el.getAttribute("src")) el.src = BED;
    el.volume = 0;
    void el.play().then(() => {
      if (onRef.current) rampTo(el, bedFade, VOLUME);
    }, giveUp);
  }, [on, rampTo, giveUp]);

  // The gate layer: follows the switch and where the visitor is standing.
  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    const want = on ? gate : null;
    if (want === layerPlaying.current) return;

    const was = layerPlaying.current;
    layerPlaying.current = want;

    const start = () => {
      if (!want) {
        el.pause();
        return;
      }
      if (layerLoaded.current !== want) {
        el.src = LAYERS[want];
        layerLoaded.current = want;
      }
      el.volume = 0;
      void el.play().then(() => {
        if (layerPlaying.current === want) rampTo(el, layerFade, VOLUME);
      }, dropLayer);
    };

    if (was && !el.paused) rampTo(el, layerFade, 0, start);
    else start();
  }, [on, gate, rampTo, dropLayer]);

  useEffect(
    () => () => {
      if (bedFade.current) window.clearInterval(bedFade.current);
      if (layerFade.current) window.clearInterval(layerFade.current);
    },
    [],
  );

  const value = useMemo(() => ({ on, toggle }), [on, toggle]);

  return (
    <SoundContext.Provider value={value}>
      {children}
      {/* No `src` until the visitor asks; `loop` because neither has an end. */}
      <audio ref={bed} loop preload="none" aria-hidden />
      <audio ref={layer} loop preload="none" aria-hidden />
    </SoundContext.Provider>
  );
}
