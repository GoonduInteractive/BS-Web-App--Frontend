"use client";

import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { sendHeartbeat } from "@/lib/api/player";

/** The API asks for about one a minute. */
const EVERY = 60_000;

/**
 * Tells the API a signed-in player has the site open, for the active-player
 * map: a heartbeat on arrival, then one a minute while the tab is in view.
 * A hidden tab stops beating, so a forgotten one doesn't count as active, and
 * one that comes back beats again unless it beat less than a minute ago.
 * A missed beat is not worth telling anyone about.
 */
export function ActivityHeartbeat() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== "signed-in") return;
    let timer: number | undefined;
    let last = 0;

    const beat = () => {
      last = Date.now();
      sendHeartbeat().catch(() => {});
    };
    const start = () => {
      if (timer !== undefined) return;
      if (Date.now() - last >= EVERY) beat();
      timer = window.setInterval(beat, EVERY);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const follow = () => (document.visibilityState === "visible" ? start() : stop());

    follow();
    document.addEventListener("visibilitychange", follow);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", follow);
    };
  }, [status]);

  return null;
}
