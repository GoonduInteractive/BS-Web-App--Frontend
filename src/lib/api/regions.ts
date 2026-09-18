import type { ActiveRegion } from "@/types/region";

/**
 * The regions with a league running, behind a typed contract. NO BACKEND —
 * the Competition frame's list, in its order.
 *
 * THE FRAME LISTS ABUJA TWICE. Five rows, and the fifth repeats the third — a
 * comp filling a list rather than a fact about the leagues. Mocks here carry
 * plausible data, so the fifth is Rivers, which the tournaments adapter
 * already names (RIVERS STATE TRIAL). FLAGGED: Goondu says which five.
 */
const REGIONS: readonly ActiveRegion[] = [
  { slug: "south-east", nameKey: "southEastLeague" },
  { slug: "lagos", nameKey: "lagos" },
  { slug: "abuja", nameKey: "abuja" },
  { slug: "ghana", nameKey: "ghana" },
  { slug: "rivers", nameKey: "rivers" },
];

export async function getActiveRegions(): Promise<readonly ActiveRegion[]> {
  return REGIONS;
}
