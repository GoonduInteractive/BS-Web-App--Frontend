"use client";

import { useSyncExternalStore } from "react";

/**
 * The time now, in whole seconds, ticking - the clock `Countdown` runs, for a
 * component that needs the number rather than a printed countdown (the HBAR
 * quote's expiry). Null on the server and in the first client render: a figure
 * from the build and one from the browser could never agree.
 */
export function useSeconds(): number | null {
  return useSyncExternalStore(subscribe, getSeconds, getServerSeconds);
}

function getSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function getServerSeconds(): null {
  return null;
}

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}
