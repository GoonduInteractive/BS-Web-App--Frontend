import type {
  ClaimJob,
  ClaimStatus,
  HederaActivity,
  HederaHoldings,
  HederaOrder,
  HederaPrize,
  IdentityCheck,
  OwnedAsset,
  PaymentItem,
  PendingLink,
  WalletLink,
} from "@/types/hedera";
import type { PlayerNotification } from "@/types/seeds";

import { z } from "zod";

import { ApiError, apiGet } from "./client";
import { MOCK_CATALOGUE, MOCK_COLLECTIONS, MOCK_HBAR_DISCOUNT_PCT, MOCK_PRIZES, MOCK_TREASURY, quoteHbar } from "./hedera-mock-data";

/**
 * THE HEDERA SECTION'S MOCK BACKEND - nothing here touches Hedera. It stands
 * in for the website backend and the Hedera service until their endpoints
 * exist, and only runs while `NEXT_PUBLIC_HEDERA_MOCK=1` (`lib/hedera/mode.ts`).
 *
 * ONE BROWSER, ONE PLAYER: the state lives in this browser's storage
 * (`bs.hedera.mock`), so a link, a claim or a purchase survives a reload.
 * Clear it to start again.
 *
 * TIME MOVES THINGS ON, as the real queues will: a mint is queued, then
 * submitted, then confirmed over ~4s; a payment is confirmed ~2.5s after it is
 * sent (the gateway's webhook), then the NFT mints; a refund goes out ~4s
 * after it is owed; the team checks an identity check ~12s after it is sent;
 * an admin approves a payout ~15s after it is ready.
 *
 * `?mock=<scenario>` on any page forces a failure for the rest of the tab -
 * `?mock=off` clears it - so every state the doc asks to design can be seen:
 * down (the Hedera service), rejected (the wallet refuses to sign), timeout
 * (pairing), createfail (embedded wallet), underpaid, expired (quotes last
 * 20s), mintfail, payoutfail, idreject (the team sends an identity check back).
 */

export type MockScenario =
  | "down"
  | "rejected"
  | "timeout"
  | "createfail"
  | "underpaid"
  | "expired"
  | "mintfail"
  | "payoutfail"
  | "idreject";

const SCENARIOS: readonly MockScenario[] = ["down", "rejected", "timeout", "createfail", "underpaid", "expired", "mintfail", "payoutfail", "idreject"];
// v2 (2026-11-23): prizes carry their tournament and the identity-check states; an older state starts again.
const STATE_KEY = "bs.hedera.mock.v2";
const SCENARIO_KEY = "bs.hedera.scenario";

const CLAIM_QUEUED_MS = 1_500;
const MINT_MS = 4_000;
const CONFIRM_MS = 2_500;
const REFUND_MS = 4_000;
const PAYOUT_MS = 15_000;
const REVIEW_MS = 12_000;
/** What the team says when it sends an identity check back (`?mock=idreject`). */
const ID_REJECT_NOTE = "The photo of the ID is too blurry to read. Send it again with every corner in view.";
const QUOTE_MS = 10 * 60_000;
const SHORT_QUOTE_MS = 20_000;
/** What a wallet holds when it is linked: a HashPack user arrives with HBAR, a new embedded wallet with a little. */
const OPENING_BALANCE = { existing: 2_450.5, embedded: 600 } as const;

/** The forced failure for this tab, from `?mock=` on any page. */
export function scenario(): MockScenario | null {
  try {
    const asked = new URLSearchParams(window.location.search).get("mock");
    if (asked === "off") sessionStorage.removeItem(SCENARIO_KEY);
    else if (asked && (SCENARIOS as readonly string[]).includes(asked)) sessionStorage.setItem(SCENARIO_KEY, asked);
    const kept = sessionStorage.getItem(SCENARIO_KEY);
    return (SCENARIOS as readonly string[]).includes(kept ?? "") ? (kept as MockScenario) : null;
  } catch {
    return null;
  }
}

// A page opened with `?mock=` takes it (or `?mock=off` drops it) as soon as it loads, not
// at its first mock call - which a page that moves on quickly might never make.
if (typeof window !== "undefined") scenario();

// ---------------------------------------------------------------- the state

type StoredClaim = ClaimJob & { accountId: string; fails: boolean };
type StoredOrder = {
  id: string;
  item: PaymentItem;
  fiat: HederaOrder["fiat"];
  hbar: number;
  memo: string;
  expiresAt: string;
  createdAt: string;
  accountId: string;
  paidAt: string | null;
  paidHbar: number | null;
  txId: string | null;
  mintFails: boolean;
};
type State = {
  link: WalletLink | null;
  pending: PendingLink | null;
  challenge: string | null;
  balances: Record<string, number>;
  associated: Record<string, string[]>;
  claims: StoredClaim[];
  orders: StoredOrder[];
  prizes: HederaPrize[];
  /** The Hedera notifications this player has read (`notices`). */
  noticesRead: string[];
};

function fresh(): State {
  const now = new Date().toISOString();
  return {
    link: null,
    pending: null,
    challenge: null,
    balances: {},
    associated: {},
    claims: [],
    orders: [],
    // The pending prize waits from now, so its approval can be watched.
    prizes: MOCK_PRIZES.map((p) => (p.status === "pending" ? { ...p, updatedAt: now } : { ...p })),
    noticesRead: [],
  };
}

function read(): State {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? { ...fresh(), ...(JSON.parse(raw) as State) } : fresh();
  } catch {
    return fresh();
  }
}

function write(state: State) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // No storage: the mock forgets on reload, which is all it can do.
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const latency = () => wait(250 + Math.random() * 250);
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const txIdAt = (account: string, ms: number) => `${account}@${Math.floor(ms / 1000)}.${String(ms % 1000).padStart(3, "0")}000000`;
const since = (iso: string, now: number) => now - Date.parse(iso);

function up() {
  if (scenario() === "down") throw new ApiError(503, "The Hedera service is not answering");
}

function linked(state: State): WalletLink {
  if (!state.link) throw new ApiError(409, "No wallet is linked");
  return state.link;
}

// ---------------------------------------------------------- what time decides

function claimStatus(c: StoredClaim, now: number): ClaimStatus {
  const t = since(c.createdAt, now);
  if (t < CLAIM_QUEUED_MS) return "queued";
  if (t < MINT_MS) return "submitted";
  return c.fails ? "failed" : "confirmed";
}

const toClaim = (c: StoredClaim, now: number): ClaimJob => {
  const status = claimStatus(c, now);
  return {
    id: c.id,
    assetId: c.assetId,
    status,
    txId: status === "confirmed" ? txIdAt(MOCK_TREASURY, Date.parse(c.createdAt) + MINT_MS) : null,
    createdAt: c.createdAt,
  };
};

function toOrder(o: StoredOrder, now: number): HederaOrder {
  const base = { id: o.id, item: o.item, fiat: o.fiat, hbar: o.hbar, memo: o.memo, payTo: MOCK_TREASURY, expiresAt: o.expiresAt, paidHbar: o.paidHbar, txId: o.txId, createdAt: o.createdAt };
  if (!o.paidAt) return { ...base, status: now > Date.parse(o.expiresAt) ? "expired" : "awaiting", mint: null, refund: null };
  const paid = Date.parse(o.paidAt);
  if (now - paid < CONFIRM_MS) return { ...base, status: "awaiting", mint: null, refund: null };
  const refund = (owedAt: number) => ({
    status: now - owedAt < REFUND_MS ? ("pending" as const) : ("sent" as const),
    txId: now - owedAt < REFUND_MS ? null : txIdAt(MOCK_TREASURY, owedAt + REFUND_MS),
  });
  if ((o.paidHbar ?? 0) < o.hbar - 0.005) return { ...base, status: "underpaid", mint: null, refund: refund(paid + CONFIRM_MS) };
  if (o.item.kind !== "asset") return { ...base, status: "confirmed", mint: null, refund: null };
  const t = now - paid - CONFIRM_MS;
  const mint: ClaimStatus = t < CLAIM_QUEUED_MS ? "queued" : t < MINT_MS ? "submitted" : o.mintFails ? "failed" : "confirmed";
  return { ...base, status: "confirmed", mint, refund: mint === "failed" ? refund(paid + CONFIRM_MS + MINT_MS) : null };
}

function toPrize(stored: HederaPrize, state: State, now: number): HederaPrize {
  let p = stored;
  // The team checks a sent identity check: it passes, or (`?mock=idreject`) comes back with a note.
  if (p.status === "reviewing") {
    const reviewed = Date.parse(p.updatedAt) + REVIEW_MS;
    if (now < reviewed) return p;
    const at = new Date(reviewed).toISOString();
    p =
      scenario() === "idreject"
        ? { ...p, status: "resubmit", identityNote: ID_REJECT_NOTE, updatedAt: at }
        : { ...p, status: "pending", identityNote: undefined, updatedAt: at };
  }
  // An admin approves a ready payout; it can only go to a linked wallet.
  if (p.status !== "pending" || !state.link) return p;
  const from = Math.max(Date.parse(p.updatedAt), Date.parse(state.link.linkedAt));
  if (now - from < PAYOUT_MS) return p;
  const at = new Date(from + PAYOUT_MS).toISOString();
  return scenario() === "payoutfail"
    ? { ...p, status: "failed", updatedAt: at }
    : { ...p, status: "sent", updatedAt: at, txId: txIdAt(MOCK_TREASURY, from + PAYOUT_MS) };
}

const chainStatus = (s: ClaimStatus): OwnedAsset["status"] => (s === "confirmed" ? "owned" : s === "failed" ? "failed" : "minting");

// ------------------------------------------------------------- the "endpoints"

export async function serviceStatus(): Promise<{ up: boolean }> {
  await latency();
  return { up: scenario() !== "down" };
}

export async function walletLink(): Promise<WalletLink | null> {
  await latency();
  return read().link;
}

export async function linkChallenge(): Promise<string> {
  await latency();
  up();
  const state = read();
  state.challenge = `Beyond Service wallet link ${id("ch")}`;
  write(state);
  return state.challenge;
}

/** The signature a mock wallet gives for a challenge; the backend checks it. */
export const mockSignature = (challenge: string) => `sig:${challenge}`;

export async function verifyLink(account: PendingLink, signature: string): Promise<PendingLink> {
  await latency();
  up();
  const state = read();
  if (!state.challenge || signature !== mockSignature(state.challenge)) throw new ApiError(401, "The signature doesn't match the challenge");
  state.pending = account;
  state.challenge = null;
  write(state);
  return account;
}

export async function confirmLink(): Promise<WalletLink> {
  await latency();
  up();
  const state = read();
  if (!state.pending) throw new ApiError(409, "Nothing to confirm");
  const link: WalletLink = { ...state.pending, linkedAt: new Date().toISOString() };
  state.link = link;
  state.pending = null;
  state.balances[link.accountId] ??= OPENING_BALANCE[link.door];
  state.associated[link.accountId] ??= link.autoAssociation ? Object.values(MOCK_COLLECTIONS) : [];
  write(state);
  return link;
}

export async function cancelLink(): Promise<void> {
  await latency();
  const state = read();
  state.pending = null;
  state.challenge = null;
  write(state);
}

export async function unlink(): Promise<void> {
  await latency();
  const state = read();
  state.link = null;
  write(state);
}

export async function holdings(): Promise<HederaHoldings> {
  await latency();
  up();
  const state = read();
  const account = linked(state).accountId;
  const now = Date.now();
  const assets: OwnedAsset[] = [];
  let hbar = state.balances[account] ?? 0;

  state.claims
    .filter((c) => c.accountId === account)
    .forEach((c, i) => {
      const status = claimStatus(c, now);
      assets.push({ assetId: c.assetId, tokenId: tokenOf(c.assetId), serial: status === "confirmed" ? 101 + i : null, status: chainStatus(status), via: "claim", acquiredAt: c.createdAt });
    });
  state.orders
    .filter((o) => o.accountId === account && o.paidHbar !== null)
    .forEach((o, i) => {
      const order = toOrder(o, now);
      hbar -= o.paidHbar ?? 0;
      if (order.refund?.status === "sent") hbar += o.paidHbar ?? 0;
      if (o.item.kind === "asset" && order.mint) {
        assets.push({ assetId: o.item.assetId, tokenId: tokenOf(o.item.assetId), serial: order.mint === "confirmed" ? 501 + i : null, status: chainStatus(order.mint), via: "purchase", acquiredAt: o.paidAt ?? o.createdAt });
      }
    });
  // A payout lands in the wallet that was linked when it went out.
  const linkedAt = Date.parse(linked(state).linkedAt);
  for (const p of state.prizes.map((p) => toPrize(p, state, now))) {
    if (p.status === "sent" && Date.parse(p.updatedAt) >= linkedAt) hbar += p.hbar;
  }

  return { hbar: Math.round(hbar * 100) / 100, assets, associated: state.associated[account] ?? [] };
}

const tokenOf = (assetId: string) => MOCK_CATALOGUE.find((a) => a.id === assetId)?.tokenId ?? MOCK_COLLECTIONS.skin;

/** The wallet's association, as the chain would record it (called by the mock wallet). */
export function recordAssociation(accountId: string, tokenId: string) {
  const state = read();
  state.associated[accountId] = [...new Set([...(state.associated[accountId] ?? []), tokenId])];
  write(state);
}

export async function requestClaim(assetId: string): Promise<ClaimJob> {
  await latency();
  up();
  const state = read();
  const account = linked(state).accountId;
  const asset = MOCK_CATALOGUE.find((a) => a.id === assetId);
  if (!asset || asset.access !== "free") throw new ApiError(404, "Not a free exclusive");
  if (!(state.associated[account] ?? []).includes(asset.tokenId)) throw new ApiError(409, "The wallet hasn't associated this collection");
  const now = Date.now();
  // One claim per player per exclusive (the idempotency key): asking again returns it, unless it failed.
  const earlier = state.claims.find((c) => c.accountId === account && c.assetId === assetId && claimStatus(c, now) !== "failed");
  if (earlier) return toClaim(earlier, now);
  const claim: StoredClaim = { id: id("clm"), assetId, status: "queued", txId: null, createdAt: new Date(now).toISOString(), accountId: account, fails: scenario() === "mintfail" };
  state.claims.push(claim);
  write(state);
  return toClaim(claim, now);
}

export async function claim(claimId: string): Promise<ClaimJob> {
  await latency();
  const found = read().claims.find((c) => c.id === claimId);
  if (!found) throw new ApiError(404, "No such claim");
  return toClaim(found, Date.now());
}

export async function createOrder(item: PaymentItem, fiat: HederaOrder["fiat"]): Promise<HederaOrder> {
  await latency();
  up();
  const state = read();
  const account = linked(state).accountId;
  const now = Date.now();
  if (item.kind === "asset") {
    const asset = MOCK_CATALOGUE.find((a) => a.id === item.assetId);
    const closed = asset?.saleEndsAt ? Date.parse(asset.saleEndsAt) < now : false;
    if (!asset || asset.access !== "sale" || asset.supply?.remaining === 0 || closed) throw new ApiError(409, "Not on sale");
    const held = state.orders.some((o) => o.accountId === account && o.item.kind === "asset" && o.item.assetId === item.assetId && o.paidAt && toOrder(o, now).mint !== "failed");
    if (held) throw new ApiError(409, "Already in the wallet");
  }
  const order: StoredOrder = {
    id: id("ord"),
    item,
    fiat,
    hbar: quoteHbar(fiat),
    memo: `BS-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    expiresAt: new Date(now + (scenario() === "expired" ? SHORT_QUOTE_MS : QUOTE_MS)).toISOString(),
    createdAt: new Date(now).toISOString(),
    accountId: account,
    paidAt: null,
    paidHbar: null,
    txId: null,
    mintFails: scenario() === "mintfail",
  };
  state.orders.push(order);
  write(state);
  return toOrder(order, now);
}

export async function order(orderId: string): Promise<HederaOrder> {
  await latency();
  const found = read().orders.find((o) => o.id === orderId);
  if (!found) throw new ApiError(404, "No such order");
  return toOrder(found, Date.now());
}

/** A payment arriving on the chain, matched by its memo (called by the mock wallet). */
export function recordPayment(accountId: string, memo: string, hbar: number): string {
  const state = read();
  const found = state.orders.find((o) => o.memo === memo);
  if (!found) throw new ApiError(404, "No order carries that memo");
  const now = Date.now();
  found.paidAt = new Date(now).toISOString();
  found.paidHbar = scenario() === "underpaid" ? Math.round(hbar * 0.9 * 100) / 100 : hbar;
  found.txId = txIdAt(accountId, now);
  write(state);
  return found.txId;
}

/**
 * THE SAMPLE PRIZES SIT ON THE LIVE TOURNAMENTS: each takes the name, slug and
 * region of one the API lists (in turn), so its VIEW TOURNAMENT opens a real
 * page (2026-11-23). With none listed, or the API down, they keep their own
 * invented ones. Read once per page load.
 */
let liveTournaments: Promise<{ slug: string; title: string; region: string | null }[]> | null = null;
function onLiveTournaments(): Promise<{ slug: string; title: string; region: string | null }[]> {
  liveTournaments ??= apiGet(
    "/v1/tournaments",
    z.array(z.object({ slug: z.string(), title: z.string(), region: z.object({ name: z.string() }).nullish() })),
  )
    .then((list) => list.map((t) => ({ slug: t.slug, title: t.title, region: t.region?.name ?? null })))
    .catch(() => []);
  return liveTournaments;
}

async function playerPrizes(state: State, now: number): Promise<HederaPrize[]> {
  const live = await onLiveTournaments();
  return state.prizes.map((stored, i) => {
    const p = toPrize(stored, state, now);
    const t = live.length ? live[i % live.length] : null;
    return t ? { ...p, tournament: t.title, tournamentSlug: t.slug, region: t.region ?? p.region } : p;
  });
}

export async function prizes(): Promise<HederaPrize[]> {
  await latency();
  return playerPrizes(read(), Date.now());
}

export async function submitIdentity(prizeId: string, check: IdentityCheck): Promise<HederaPrize> {
  await latency();
  if (!check.fullName.trim() || !check.dateOfBirth || !check.idNumber.trim()) throw new ApiError(400, "Every field is needed");
  const state = read();
  const found = state.prizes.find((p) => p.id === prizeId);
  if (!found) throw new ApiError(404, "No such prize");
  if (found.status !== "verify" && found.status !== "resubmit") throw new ApiError(409, "This prize isn't waiting for an identity check");
  found.status = "reviewing";
  delete found.identityNote;
  found.updatedAt = new Date().toISOString();
  write(state);
  return toPrize(found, state, Date.now());
}

/**
 * What the website backend would tell the player about their prizes, in the
 * bell (the team, 2026-11-23: an identity check is asked for by email and in
 * the app). Worked out from the prizes; the words are the backend's to write.
 */
export async function notices(): Promise<PlayerNotification[]> {
  await latency();
  const state = read();
  const now = Date.now();
  const hbar = (n: number) => `${n.toLocaleString("en-NG")} HBAR`;
  const rows: PlayerNotification[] = [];
  for (const p of await playerPrizes(state, now)) {
    const href = `/hedera/prize?id=${encodeURIComponent(p.id)}`;
    const add = (key: string, title: string, body: string) => {
      const id = `hedera-${p.id}-${key}`;
      rows.push({ id, title, body, read: state.noticesRead.includes(id), sentAt: p.updatedAt, href });
    };
    if (p.status === "verify")
      add("verify", "Confirm it's you to get your prize", `Your ${hbar(p.hbar)} prize from ${p.tournament} is waiting for a quick identity check.`);
    else if (p.status === "resubmit")
      add(`resubmit-${p.updatedAt}`, "We couldn't confirm your ID", `Your ${hbar(p.hbar)} prize from ${p.tournament} is waiting. ${p.identityNote ?? ""}`.trim());
    else if (p.status === "pending" && p.needsIdentity)
      add("verified", "Your ID is confirmed", `Your ${hbar(p.hbar)} prize from ${p.tournament} is waiting for our team's approval.`);
    else if (p.status === "sent") add("sent", "Your HBAR prize was sent", `${hbar(p.hbar)} from ${p.tournament} went to your linked wallet.`);
  }
  return rows.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export async function readNotices(ids: readonly string[]): Promise<void> {
  const state = read();
  state.noticesRead = [...new Set([...state.noticesRead, ...ids])];
  write(state);
}

/** The HBAR checkout discount, in percent: the admin's Treasury setting. */
export async function hbarDiscountPct(): Promise<number> {
  return MOCK_HBAR_DISCOUNT_PCT;
}

export async function activity(): Promise<HederaActivity[]> {
  await latency();
  const state = read();
  const now = Date.now();
  const name = (assetId: string) => MOCK_CATALOGUE.find((a) => a.id === assetId)?.name ?? assetId;
  const rows: HederaActivity[] = [];

  for (const c of state.claims) {
    const job = toClaim(c, now);
    if (job.status === "confirmed") rows.push({ id: c.id, kind: "claim", title: name(c.assetId), hbar: null, at: c.createdAt, txId: job.txId, href: null });
  }
  for (const o of state.orders) {
    if (!o.paidAt) continue;
    const view = toOrder(o, now);
    rows.push({ id: o.id, kind: "purchase", title: o.item.name, hbar: -(o.paidHbar ?? 0), at: o.paidAt, txId: o.txId, href: { kind: "order", id: o.id } });
    if (view.refund?.status === "sent") {
      rows.push({ id: `${o.id}-refund`, kind: "refund", title: o.item.name, hbar: o.paidHbar ?? 0, at: o.paidAt, txId: view.refund.txId, href: { kind: "order", id: o.id } });
    }
  }
  for (const p of state.prizes.map((p) => toPrize(p, state, now))) {
    if (p.status === "sent") rows.push({ id: p.id, kind: "payout", title: p.tournament, hbar: p.hbar, at: p.updatedAt, txId: p.txId, href: { kind: "prize", id: p.id } });
  }
  return rows.sort((a, b) => b.at.localeCompare(a.at));
}
