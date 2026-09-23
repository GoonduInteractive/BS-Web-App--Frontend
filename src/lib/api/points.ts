import type { PointsBalance } from "@/types/merch";

/**
 * The community points balance, behind a typed contract.
 *
 * NO AUTHENTICATION HAPPENS HERE OR ANYWHERE ELSE IN THIS BUILD. The store has
 * three designed states - signed out, signed in with points, signed in with
 * none - and this file supplies the numbers for the last two. Which state the
 * page renders is a mock flag (see `getViewerState`), not a session: nothing is
 * verified, no credential is collected, no token is stored.
 *
 * That is the whole of the "no backend, no auth" rule as it applies to these
 * frames. When there is a real account system, this adapter starts reading it
 * and the three states become real without the components changing.
 */

/** Which of the store's three designed states to render. */
export type ViewerState = "signed-out" | "points" | "no-points";

/**
 * The state the store renders in.
 *
 * FIXED TO `signed-out`, WHICH IS THE FRAME MARKED "Not logged in" - the base
 * state and the only one a visitor can reach today. The other two exist as
 * designed screens and are reachable by changing this one return value, which
 * is deliberately the single place that decides.
 */
export async function getViewerState(): Promise<ViewerState> {
  return "signed-out";
}

/**
 * The balance for the signed-in states.
 *
 * The numbers are the frame's: 2000 points held, the next tier 500 away, so the
 * progress bar sits at 80%. Realistic rather than round-and-fake, per the mock
 * data rule.
 */
export async function getPointsBalance(): Promise<PointsBalance> {
  const state = await getViewerState();

  // The "No points" frame is the same two panels with a zero balance and no
  // perks - the perks list is what swaps POINT PERKS from a list to the single
  // "no points yet" line, so an empty array IS that state rather than a flag.
  if (state === "no-points") {
    return { points: 0, nextTierAt: 500, perkKeys: [] };
  }

  return {
    points: 2000,
    nextTierAt: 2500,
    perkKeys: ["discount", "featured"],
  };
}
