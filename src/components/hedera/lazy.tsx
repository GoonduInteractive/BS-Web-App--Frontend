"use client";

import dynamic from "next/dynamic";

/**
 * Hedera parts that sit on pages outside the section, imported lazily FROM A
 * CLIENT MODULE: a `dynamic()` written in a server component is still
 * preloaded with the page, so the mock and its data would ship with every
 * tournament page even with the section off. From here the code is fetched
 * only when the part is drawn, which is only while the section is on.
 */
export const LazyTournamentHbarPrizes = dynamic(() =>
  import("@/components/hedera/TournamentHbarPrizes").then((m) => m.TournamentHbarPrizes),
);

/** The Calabash's HBAR tab, for the profile (the hub imports it directly). */
export const LazyCalabashHbar = dynamic(() => import("@/components/hedera/CalabashHbar").then((m) => m.CalabashHbar));
