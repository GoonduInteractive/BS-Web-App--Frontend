import { getAll, getByState } from "nigeria-lga-data";

/**
 * Shipping, as the checkout needs it. A place's price is the API's quote
 * (`getShippingQuote` in `lib/api/store.ts`): the admin's prices and
 * free-shipping promotion, asked for once the checkout knows the state and
 * local government.
 *
 * Places come from `nigeria-lga-data` - the same package the admin uses - so
 * a state or local government is named identically on both sides.
 */

export type DeliveryMethod = "homeDelivery" | "pickup";

export type Lga = { id: string; name: string };

const STATES = [...new Set(getAll().map((l) => l.state))];

/**
 * Free shipping for a promotional campaign (the team, 2026-10-01), set in the
 * admin's Shipping page: while it runs, an order whose items total reaches
 * `minimumOrder` ships free by either method. Dates are ISO instants; none
 * means it runs until switched off.
 */
export type FreeShippingPromo = { enabled: boolean; minimumOrder: number; startsAt?: string; endsAt?: string };

/** Whether the promotion is running now. */
export function promoLive(p: FreeShippingPromo, now = Date.now()): boolean {
  return p.enabled && (!p.startsAt || now >= Date.parse(p.startsAt)) && (!p.endsAt || now < Date.parse(p.endsAt));
}

/** Whether an order with this items total ships free right now. */
export function shipsFree(p: FreeShippingPromo, itemTotal: number, now = Date.now()): boolean {
  return promoLive(p, now) && itemTotal >= p.minimumOrder;
}

/** Every state's local governments, A to Z, keyed by state name. */
export async function getLgasByState(): Promise<Record<string, readonly Lga[]>> {
  return Object.fromEntries(
    STATES.map((s) => [s, getByState(s).map((l) => ({ id: l.id, name: l.name })).sort((a, b) => a.name.localeCompare(b.name))]),
  );
}
