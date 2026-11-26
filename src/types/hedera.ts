/**
 * The Hedera section's contracts, after Sophia's "Hedera on the Website (v2
 * Scope)" (2026-11-09): what the website backend and the Hedera service will
 * send. Served by the mock in `lib/api/hedera-mock.ts` until they exist; when
 * they do, the adapter maps their replies onto these and no screen changes.
 *
 * WHO OWNS WHAT (the doc's table): the asset catalogue is the game backend's,
 * the wallet link the website backend's, ownership, mints, payments and
 * payouts the Hedera service's. Seeds never touch Hedera, and Seeds and HBAR
 * never convert into each other.
 */

export type AssetFamily = "skin" | "weapon" | "character";
export type AssetRarity = "common" | "rare" | "epic" | "legendary";

export const ASSET_FAMILIES: readonly AssetFamily[] = ["skin", "weapon", "character"];
export const ASSET_RARITIES: readonly AssetRarity[] = ["common", "rare", "epic", "legendary"];

/** A price as the game store sets it: naira or US dollars. HBAR is only ever a quote of it. */
export type FiatPrice = { amount: number; currency: "NGN" | "USD" };

/** One Hedera exclusive from the game's catalogue (asset IDs are stable across Goondu games). */
export type HederaAsset = {
  id: string;
  name: string;
  description: string;
  family: AssetFamily;
  rarity: AssetRarity;
  image: string;
  imageAlt: string;
  /** The Goondu games that recognise it. */
  games: string[];
  /** Sold in the game store, or free to every player who links a wallet. */
  access: "sale" | "free";
  /** Null for a free exclusive. */
  price: FiatPrice | null;
  /** A limited edition's size and what's left; null when unlimited. */
  supply: { total: number; remaining: number } | null;
  /** ISO instant a limited-time sale ends; null when it doesn't. */
  saleEndsAt: string | null;
  /** Its HTS token (one collection per family). */
  tokenId: string;
};

export type WalletDoor = "existing" | "embedded";

/** The player's verified wallet, stored on their community account. */
export type WalletLink = {
  /** Hedera account ID, `0.0.x`. Public on the network. */
  accountId: string;
  door: WalletDoor;
  /** HashPack, or the embedded wallet's sign-in: Google or email. */
  provider: string;
  linkedAt: string;
  /** Embedded wallets are made with automatic token association on. */
  autoAssociation: boolean;
};

/** An account the backend has verified and is waiting for the player to confirm. */
export type PendingLink = Omit<WalletLink, "linkedAt">;

export type ChainStatus = "minting" | "owned" | "failed";

/** An exclusive in the player's wallet, as the Hedera service's ownership table has it. */
export type OwnedAsset = {
  assetId: string;
  tokenId: string;
  /** The NFT's serial number; null until minted. */
  serial: number | null;
  status: ChainStatus;
  via: "claim" | "purchase";
  acquiredAt: string;
};

/** What the linked wallet holds, read from the Mirror Node through the Hedera service. */
export type HederaHoldings = {
  hbar: number;
  assets: OwnedAsset[];
  /** Collections the wallet has associated (an embedded wallet associates automatically). */
  associated: string[];
};

/** The mint queue's statuses for one claim. */
export type ClaimStatus = "queued" | "submitted" | "confirmed" | "failed";

export type ClaimJob = {
  id: string;
  assetId: string;
  status: ClaimStatus;
  txId: string | null;
  createdAt: string;
};

export type PaymentStatus = "awaiting" | "confirmed" | "expired" | "underpaid" | "failed";

/** What an HBAR payment is for: an exclusive, or an order from the merch or comics checkout. */
export type PaymentItem =
  | { kind: "asset"; assetId: string; name: string; image: string }
  /** `listPrice`: the order's naira before the HBAR discount, when one was taken off (`fiat` is after it). */
  | { kind: "order"; orderId: string; name: string; listPrice?: number; discountPct?: number };

/**
 * An HBAR order: the payment intent and, for an exclusive, its mint. The quote
 * holds until `expiresAt`; the payment carries `memo` so the gateway can match it.
 */
export type HederaOrder = {
  id: string;
  item: PaymentItem;
  fiat: FiatPrice;
  /** The quote, in HBAR. */
  hbar: number;
  memo: string;
  /** Goondu's receiving account. */
  payTo: string;
  status: PaymentStatus;
  expiresAt: string;
  /** What arrived, once something did. */
  paidHbar: number | null;
  txId: string | null;
  /** Exclusives only: the mint after payment. */
  mint: ClaimStatus | null;
  /** Paid but never minted, or underpaid: the HBAR goes back. */
  refund: { status: "pending" | "sent"; txId: string | null } | null;
  createdAt: string;
};

/**
 * Where a prize stands, as the player sees it. Above the identity-check
 * threshold it goes `verify` (send your ID) → `reviewing` (the team checks it)
 * → `pending`, or back to `resubmit` with the team's note; every prize then
 * waits for an admin's approval, and is `sent` or `failed` (the team,
 * 2026-11-23: the KYC flow).
 */
export type PrizeStatus = "verify" | "reviewing" | "resubmit" | "pending" | "sent" | "failed";

/** A tournament prize paid in HBAR. Every payout waits for an admin. */
export type HederaPrize = {
  id: string;
  /** The tournament as it was played: the prize page shows it whole, not just the receipt. */
  tournament: string;
  tournamentSlug: string;
  region: string;
  startedAt: string;
  endedAt: string;
  players: number;
  place: number;
  hbar: number;
  /** Above the identity-check threshold. */
  needsIdentity: boolean;
  status: PrizeStatus;
  /** What the team asked the player to fix, when it sent the identity check back. */
  identityNote?: string;
  txId: string | null;
  updatedAt: string;
};

/** What the identity check asks for, above the threshold. */
export type IdentityCheck = { fullName: string; dateOfBirth: string; idType: "nin" | "passport" | "drivers" | "voters"; idNumber: string };

export type ActivityKind = "purchase" | "claim" | "payout" | "refund";

export type HederaActivity = {
  id: string;
  kind: ActivityKind;
  title: string;
  /** HBAR in (payout, refund) or out (purchase); null for a free claim. */
  hbar: number | null;
  at: string;
  txId: string | null;
  /** Where the screen links: the order, the prize, or nothing. */
  href: { kind: "order" | "prize"; id: string } | null;
};

/** How a tournament pays, set per tournament by an admin. */
export type TournamentPrizeType = "cash" | "hbar" | "both";
