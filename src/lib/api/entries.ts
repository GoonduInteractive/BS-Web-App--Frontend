import { z } from "zod";

import { ApiError } from "./client";
import { startPayment } from "./payments";
import { authedRequest } from "./session";

/**
 * A player's place in a tournament, read and written in the browser as them:
 * `/v1/tournaments/{slug}/registration` and `/register`, and `/v1/payments/init`
 * for an entry fee.
 *
 * A PAID TOURNAMENT IS PAID FOR, NOT REGISTERED FOR. The payment names the
 * tournament (`purpose: tournament_entry`, `product_id` its id - the admin's
 * transactions carry a `tournament_id`), and an entry has no "awaiting payment"
 * state, so the site reads it as: the payment's webhook makes the entry. The
 * player goes to Paystack and comes back to the tournament's page. FLAGGED:
 * the API doesn't say which comes first.
 */

const registration = z.object({ registered: z.boolean() });

export async function getMyEntry(slug: string): Promise<{ registered: boolean }> {
  return authedRequest("GET", `/v1/tournaments/${encodeURIComponent(slug)}/registration`, registration);
}

/** Registers the player. Already registered counts as done. */
export async function enterTournament(slug: string): Promise<void> {
  try {
    await authedRequest("POST", `/v1/tournaments/${encodeURIComponent(slug)}/register`, z.unknown());
  } catch (e) {
    if (e instanceof ApiError && (e.status === 409 || /already/i.test(e.message))) return;
    throw e;
  }
}

/** Starts paying the entry fee. Returns where to send the player (`startPayment`). */
export function payEntryFee(tournamentId: string, callbackUrl: string): Promise<string> {
  return startPayment("tournament_entry", tournamentId, callbackUrl);
}
