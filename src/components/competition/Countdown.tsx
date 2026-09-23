"use client";

import { useSyncExternalStore } from "react";

/**
 * HH:MM:SS to an ISO instant, ticking. The match cards' "ENDS 24 :00:00".
 *
 * A static page cannot print a countdown that is right for more than a second,
 * so this is the one place on the site that runs a clock. It is read through
 * `useSyncExternalStore`: the clock is an external source of truth, the
 * subscription is a one-second interval, and THE SERVER SNAPSHOT IS NULL - a
 * figure computed at build and one computed on the client can never agree to
 * the second, and React rightly refuses the mismatch, so the HTML carries
 * "--:--:--" and the first client read fills it in. Floors at zero rather than
 * counting past the end.
 *
 * Hours are not capped at 24 - a match that ends in two days reads 48:00:00,
 * which is what a countdown means.
 */
export function Countdown({ to, pattern }: { to: string; pattern: string }) {
  const now = useSyncExternalStore(subscribe, getSeconds, getServerSeconds);

  if (now === null) return <>{pattern.replace("{time}", "--:--:--")}</>;

  const total = Math.max(0, Math.floor(new Date(to).getTime() / 1000) - now);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return <>{pattern.replace("{time}", `${pad(h)}:${pad(m)}:${pad(s)}`)}</>;
}

/** Whole seconds, so the snapshot only changes when the display would. */
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
