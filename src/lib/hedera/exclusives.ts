import type { HederaAsset, HederaHoldings, OwnedAsset } from "@/types/hedera";

export type HeldExclusive = { asset: HederaAsset; held: OwnedAsset };

/**
 * The catalogue against the wallet: what's in it (owned, or still minting, or
 * failed to arrive), and the free exclusives not yet claimed. A failed claim
 * can be claimed again, so it counts as claimable too.
 */
export function splitExclusives(catalogue: readonly HederaAsset[], holdings: HederaHoldings | undefined) {
  const held: HeldExclusive[] = [];
  for (const h of holdings?.assets ?? []) {
    const asset = catalogue.find((a) => a.id === h.assetId);
    if (asset && h.status !== "failed") held.push({ asset, held: h });
  }
  const has = new Set(held.map((h) => h.asset.id));
  const claimable = catalogue.filter((a) => a.access === "free" && !has.has(a.id));
  return { held, claimable };
}

/** Whether the wallet already holds (or is being sent) an exclusive. */
export function holdingOf(assetId: string, holdings: HederaHoldings | undefined): OwnedAsset | null {
  return holdings?.assets.find((a) => a.assetId === assetId && a.status !== "failed") ?? null;
}
