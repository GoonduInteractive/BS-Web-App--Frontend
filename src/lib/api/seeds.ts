import { z } from "zod";

import type { RewardCode, RewardTier, SeedsBalance } from "@/types/seeds";

import { fromMinor } from "./client";
import { authedRequest } from "./session";

/**
 * The signed-in player's Seeds and the store discounts they buy, read as them
 * in the browser:
 *
 *   GET  /v1/points          getMySeeds(): the Calabash, the Legacy and what's on hold
 *   GET  /v1/rewards         getRewardTiers(): every discount and what it costs
 *   GET  /v1/rewards/mine    getMyRewardCodes(): the codes they've bought
 *   POST /v1/rewards/redeem  redeemReward(): Seeds out of the Calabash, a code back
 *
 * A code is spent at checkout (`placeOrder`'s `discountCode`).
 *
 * Seeds are earned elsewhere: the game pushes its own (the game bridge, not
 * this site), and the comic reader reports reading (`lib/api/library.ts`).
 */

/** The balance, as the API sends it on `/v1/points` and inside the profile. */
export const apiSeeds = z.object({
  calabash: z.coerce.number().default(0),
  legacy: z.coerce.number().default(0),
  pending: z.coerce.number().default(0),
});

export async function getMySeeds(): Promise<SeedsBalance> {
  return authedRequest("GET", "/v1/points", apiSeeds);
}

const apiTier = z.object({
  reward_name: z.string(),
  discount_pct: z.coerce.number(),
  seeds_cost: z.coerce.number(),
  naira_cap_minor: z.coerce.number(),
});

/** Cheapest first. */
export async function getRewardTiers(): Promise<readonly RewardTier[]> {
  const { items } = await authedRequest("GET", "/v1/rewards", z.object({ items: z.array(apiTier).default([]) }));
  return items
    .map((t) => ({ name: t.reward_name, discountPct: t.discount_pct, cost: t.seeds_cost, capNaira: fromMinor(t.naira_cap_minor) }))
    .sort((a, b) => a.cost - b.cost);
}

const apiCode = z.object({
  id: z.string(),
  code: z.string(),
  discount_pct: z.coerce.number(),
  seeds_cost: z.coerce.number(),
  status: z.string().default(""),
  used_at: z.string().nullish(),
  created_at: z.string(),
});

/**
 * The statuses aren't listed in the spec: a code is usable unless it's been
 * used or reads as spent, expired or withdrawn. FLAGGED: ask for the list.
 */
const spent = /(^|[^a-z])(used|expired|cancell?ed|void(ed)?|revoked|invalid)/i; // "unused" doesn't match

/** Newest first. */
export async function getMyRewardCodes(): Promise<readonly RewardCode[]> {
  const { items } = await authedRequest("GET", "/v1/rewards/mine", z.object({ items: z.array(apiCode).default([]) }));
  return items
    .map((c) => ({
      id: c.id,
      code: c.code,
      discountPct: c.discount_pct,
      cost: c.seeds_cost,
      usable: !c.used_at && !spent.test(c.status),
      ...(c.used_at && { usedAt: c.used_at }),
      createdAt: c.created_at,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Buys a reward: its Seeds leave the Calabash and a single-use code comes
 * back. `attempt` is the idempotency key, one per redeem the player means: a
 * retry of the same one gets the same code rather than paying twice.
 */
export async function redeemReward(discountPct: number, attempt: string): Promise<{ code: string; discountPct: number; calabash: number }> {
  const reply = await authedRequest(
    "POST",
    "/v1/rewards/redeem",
    z.object({ code: z.string(), discount_pct: z.coerce.number(), seeds_spent: z.coerce.number(), calabash: z.coerce.number() }),
    { discount_pct: discountPct, idempotency_key: attempt },
  );
  return { code: reply.code, discountPct: reply.discount_pct, calabash: reply.calabash };
}
