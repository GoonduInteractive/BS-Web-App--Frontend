import { getAll, getByState } from "nigeria-lga-data";

/**
 * Shipping prices, behind a typed contract. NO BACKEND: admins set these per
 * state and local government in the admin's Shipping page; until the store
 * reads that, this adapter returns the same sample prices the admin starts
 * with, so the checkout's totals behave the way the real ones will.
 *
 * Places come from `nigeria-lga-data` - the same package the admin uses - so
 * a state or local government is named identically on both sides.
 */

export type DeliveryMethod = "homeDelivery" | "pickup";

/** One local government's own prices; a side left out uses the state's. */
type LgaShipping = { homeDelivery?: number; pickup?: number };

export type StateShipping = { state: string; homeDelivery: number; pickup: number; lgas: Record<string, LgaShipping> };

export type Lga = { id: string; name: string };

/** Mirrors the admin's sample: by distance from Lagos, by geopolitical zone. */
const ZONE_PRICE: Record<string, [number, number]> = {
  "South West": [3_000, 2_000],
  "South East": [3_500, 2_500],
  "South South": [3_500, 2_500],
  "North Central": [4_000, 3_000],
  "North West": [5_000, 3_500],
  "North East": [5_500, 4_000],
};

const OVERRIDES: Record<string, Record<string, LgaShipping>> = {
  Lagos: { "lagos-ibeju-lekki": { homeDelivery: 4_000 }, "lagos-epe": { homeDelivery: 4_000, pickup: 2_000 } },
  Enugu: { "enugu-nsukka": { homeDelivery: 4_500 } },
};

const STATES = [...new Set(getAll().map((l) => l.state))];

const RATES: readonly StateShipping[] = STATES.map((state) => {
  const [homeDelivery, pickup] = state === "Lagos" ? [2_500, 1_500] : (ZONE_PRICE[getByState(state)[0]?.geopoliticalZone] ?? [4_000, 3_000]);
  return { state, homeDelivery, pickup, lgas: OVERRIDES[state] ?? {} };
});

/**
 * Free shipping for a promotional campaign (the team, 2026-10-01), set in the
 * admin's Shipping page: while it runs, an order whose items total reaches
 * `minimumOrder` ships free by either method. Dates are ISO instants; none
 * means it runs until switched off.
 */
export type FreeShippingPromo = { enabled: boolean; minimumOrder: number; startsAt?: string; endsAt?: string };

/** SAMPLE, mirroring the admin's: live, on orders of ₦30,000 or more. */
const FREE_SHIPPING: FreeShippingPromo = { enabled: true, minimumOrder: 30_000 };

export async function getFreeShipping(): Promise<FreeShippingPromo> {
  return FREE_SHIPPING;
}

/** Whether the promotion is running now. */
export function promoLive(p: FreeShippingPromo, now = Date.now()): boolean {
  return p.enabled && (!p.startsAt || now >= Date.parse(p.startsAt)) && (!p.endsAt || now < Date.parse(p.endsAt));
}

/** Whether an order with this items total ships free right now. */
export function shipsFree(p: FreeShippingPromo, itemTotal: number, now = Date.now()): boolean {
  return promoLive(p, now) && itemTotal >= p.minimumOrder;
}

export async function getShippingRates(): Promise<readonly StateShipping[]> {
  return RATES;
}

/** Every state's local governments, A to Z, keyed by state name. */
export async function getLgasByState(): Promise<Record<string, readonly Lga[]>> {
  return Object.fromEntries(
    STATES.map((s) => [s, getByState(s).map((l) => ({ id: l.id, name: l.name })).sort((a, b) => a.name.localeCompare(b.name))]),
  );
}
