"use client";

import { useSyncExternalStore } from "react";

/**
 * Tracks `prefers-reduced-motion`.
 *
 * The global block in globals.css only collapses CSS `animation-duration` and
 * `transition-duration`. GSAP writes inline transforms frame by frame and is
 * completely unaffected by it, so every GSAP timeline has to consult this hook
 * and choose a DIFFERENT motion, not merely a shorter one.
 *
 * useSyncExternalStore rather than useState plus useEffect: a media query is an
 * external store, and subscribing to it this way avoids the cascading render
 * that calling setState inside an effect would cause.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** The server cannot know the preference, so it renders the full-motion tree. */
function getServerSnapshot() {
  return false;
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
