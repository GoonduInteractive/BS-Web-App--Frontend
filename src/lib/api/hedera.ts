import { HEDERA_NETWORK } from "@/lib/hedera/mode";
import type {
  ClaimJob,
  HederaActivity,
  HederaAsset,
  HederaHoldings,
  HederaOrder,
  HederaPrize,
  IdentityCheck,
  PaymentItem,
  PendingLink,
  TournamentPrizeType,
  WalletLink,
} from "@/types/hedera";
import type { PlayerNotification } from "@/types/seeds";

import * as mock from "./hedera-mock";
import { MOCK_CATALOGUE, MOCK_HBAR_PRIZES, mockPrizeType, quoteHbar } from "./hedera-mock-data";

/**
 * The Hedera section's data: the calls the doc's "Calls between systems" gives
 * the website, through the website backend (which talks to the Hedera
 * service). NONE OF THESE ENDPOINTS EXISTS YET: every function is served by
 * the mock (`hedera-mock.ts`) and only runs while the section is on
 * (`lib/hedera/mode.ts`). Each one names what it will become; the paths are
 * placeholders for Tobi to settle, and swapping one in changes this file only.
 *
 * The catalogue is the game backend's and public, so it can be read on the
 * server at build; everything else is one player's and read in the browser.
 */

// ------------------------------------------------------------------ public

/** GET /v1/hedera/store - the game store's exclusives (the game backend's catalogue). */
export async function getCatalogue(): Promise<readonly HederaAsset[]> {
  return MOCK_CATALOGUE;
}

/** GET /v1/hedera/store/{assetId} */
export async function getAsset(assetId: string): Promise<HederaAsset | null> {
  return MOCK_CATALOGUE.find((a) => a.id === assetId) ?? null;
}

/** The store's HBAR figure for a price: an estimate on the shelf, a quote that expires at checkout. */
export const estimateHbar = quoteHbar;

/**
 * A tournament's prize: cash, HBAR or both, with HBAR per place (the doc: set
 * per tournament by an admin). The tournament endpoints don't carry it yet.
 */
export function getTournamentPrize(slug: string): { type: TournamentPrizeType; hbar: readonly number[] } {
  const type = mockPrizeType(slug);
  return { type, hbar: type === "cash" ? [] : MOCK_HBAR_PRIZES };
}

// ----------------------------------------------------- the signed-in player

/** GET /v1/hedera/status - whether the Hedera service answers (the hub's "service down" state). */
export const getHederaStatus = (): Promise<{ up: boolean }> => mock.serviceStatus();

/** GET /v1/player/wallet - the linked wallet, from the community account. Null when none. */
export const getWalletLink = (): Promise<WalletLink | null> => mock.walletLink();

/** POST /v1/player/wallet/challenge - a single-use challenge for the wallet to sign. */
export const createLinkChallenge = (): Promise<string> => mock.linkChallenge();

/** POST /v1/player/wallet/verify - the signed challenge; the account comes back to be confirmed. */
export const verifyWalletLink = (account: PendingLink, signature: string): Promise<PendingLink> => mock.verifyLink(account, signature);

/** POST /v1/player/wallet/confirm - the player said "this is my wallet": the link is stored. */
export const confirmWalletLink = (): Promise<WalletLink> => mock.confirmLink();

/** DELETE /v1/player/wallet/pending - the player said "not my wallet". */
export const cancelWalletLink = (): Promise<void> => mock.cancelLink();

/** DELETE /v1/player/wallet - unlink. Exclusives stay in the wallet they were sent to. */
export const unlinkWallet = (): Promise<void> => mock.unlink();

/** GET /v1/hedera/holdings - HBAR and exclusives in the linked wallet (Mirror Node, cached). */
export const getHoldings = (): Promise<HederaHoldings> => mock.holdings();

/** POST /v1/hedera/claims - claim a free exclusive; it joins the mint queue. */
export const requestClaim = (assetId: string): Promise<ClaimJob> => mock.requestClaim(assetId);

/** GET /v1/hedera/claims/{id} */
export const getClaim = (claimId: string): Promise<ClaimJob> => mock.claim(claimId);

/** POST /v1/hedera/orders - a payment intent: the HBAR quote, its expiry and the memo to pay with. */
export const createHbarOrder = (item: PaymentItem, fiat: HederaOrder["fiat"]): Promise<HederaOrder> => mock.createOrder(item, fiat);

/** GET /v1/hedera/orders/{id} - polled while the payment is awaited and the NFT mints. */
export const getHbarOrder = (orderId: string): Promise<HederaOrder> => mock.order(orderId);

/** GET /v1/hedera/prizes - the player's HBAR tournament prizes. */
export const getPrizes = (): Promise<HederaPrize[]> => mock.prizes();

/** POST /v1/hedera/prizes/{id}/identity - the identity check, above the threshold. */
export const submitPrizeIdentity = (prizeId: string, check: IdentityCheck): Promise<HederaPrize> => mock.submitIdentity(prizeId, check);

/** GET /v1/hedera/activity - purchases, claims, payouts and refunds. */
export const getHederaActivity = (): Promise<HederaActivity[]> => mock.activity();

/**
 * The player's Hedera notifications. Live, these are ordinary rows in
 * `GET /v1/notifications`, written by the backend when a prize needs an
 * identity check, when the team sends one back or confirms it, and when a
 * prize is sent, each with an email too (the team, 2026-11-23). In the mock
 * they are merged into the bell by `lib/api/notifications.ts`.
 */
export const getHederaNotices = (): Promise<PlayerNotification[]> => mock.notices();

/** Marks mock Hedera notifications read (live: `PATCH /v1/notifications/{id}/read`). */
export const readHederaNotices = (ids: readonly string[]): Promise<void> => mock.readNotices(ids);

/**
 * GET /v1/hedera/config - the HBAR checkout discount in percent: what the
 * admin sets on Treasury (2.5% to start). 0 offers none.
 */
export const getHbarDiscountPct = (): Promise<number> => mock.hbarDiscountPct();

// ------------------------------------------------------------------ links

/** A transaction, or an account, on HashScan. */
export function hashscanUrl(kind: "transaction" | "account" | "token", value: string): string {
  return `https://hashscan.io/${HEDERA_NETWORK}/${kind}/${encodeURIComponent(value)}`;
}
