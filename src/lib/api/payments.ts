import { z } from "zod";

import { ApiError } from "./client";
import { authedRequest } from "./session";

/**
 * Paying for something - an order, a tournament entry - as the signed-in
 * player: `POST /v1/payments/init` names it and where Paystack should send the
 * player back.
 *
 * A ZERO-TOTAL ORDER NEVER SEES PAYSTACK (since 2026-11-02): a free comic
 * chapter, say. The API answers `free: true`, has already fulfilled it, and
 * gives no checkout page - so the player goes straight back to `callbackUrl`,
 * as if from Paystack, and that page reads the order as paid.
 *
 * THE CHECKOUT PAGE COMES AS `payment_url` (seen 2026-11-06), with no `free`.
 * The spec still calls it `authorization_url`, as the API once did, so either
 * is read.
 */
const initReply = z.object({
  free: z.boolean().default(false),
  payment_url: z.string().nullish(),
  authorization_url: z.string().nullish(),
});

/** Where to send the player: Paystack's checkout, or back to `callbackUrl` when nothing is owed. */
export async function startPayment(purpose: "order" | "tournament_entry", productId: string, callbackUrl: string): Promise<string> {
  const reply = await authedRequest("POST", "/v1/payments/init", initReply, {
    product_id: productId,
    callback_url: callbackUrl,
    purpose,
  });
  if (reply.free) return callbackUrl;
  const checkoutPage = reply.payment_url ?? reply.authorization_url;
  if (!checkoutPage) throw new ApiError(502, "POST /v1/payments/init: no checkout page in the reply");
  return checkoutPage;
}
