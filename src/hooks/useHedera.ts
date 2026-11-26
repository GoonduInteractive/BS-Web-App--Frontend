"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  getCatalogue,
  getClaim,
  getHbarOrder,
  getHederaActivity,
  getHederaStatus,
  getHoldings,
  getPrizes,
  getWalletLink,
} from "@/lib/api/hedera";

/**
 * The Hedera section's reads, in the browser, as the signed-in player. Idle
 * while nobody is signed in. Anything still moving - a mint, a payment, a
 * payout waiting for an admin - is polled until it settles.
 */
export const HEDERA_KEYS = {
  all: ["hedera"] as const,
  catalogue: ["hedera", "catalogue"] as const,
  status: ["hedera", "status"] as const,
  link: ["hedera", "link"] as const,
  holdings: ["hedera", "holdings"] as const,
  claim: (id: string) => ["hedera", "claim", id] as const,
  order: (id: string) => ["hedera", "order", id] as const,
  prizes: ["hedera", "prizes"] as const,
  activity: ["hedera", "activity"] as const,
};

function useSignedIn() {
  return useAuth().status === "signed-in";
}

/** The game store's exclusives (public), for screens that are read in the browser. */
export function useCatalogue() {
  return useQuery({ queryKey: HEDERA_KEYS.catalogue, queryFn: getCatalogue, staleTime: 5 * 60_000 });
}

export function useHederaStatus() {
  return useQuery({ queryKey: HEDERA_KEYS.status, queryFn: getHederaStatus, enabled: useSignedIn(), staleTime: 30_000 });
}

export function useWalletLink() {
  return useQuery({ queryKey: HEDERA_KEYS.link, queryFn: getWalletLink, enabled: useSignedIn() });
}

/** What the linked wallet holds. Idle without a linked wallet. */
export function useHoldings() {
  const link = useWalletLink();
  return useQuery({
    queryKey: HEDERA_KEYS.holdings,
    queryFn: getHoldings,
    enabled: !!link.data,
    retry: false,
    refetchInterval: (q) => (q.state.data?.assets.some((a) => a.status === "minting") ? 1_500 : false),
  });
}

export function useClaim(id: string | null) {
  return useQuery({
    queryKey: HEDERA_KEYS.claim(id ?? ""),
    queryFn: () => getClaim(id ?? ""),
    enabled: !!id,
    refetchInterval: (q) => (q.state.data && (q.state.data.status === "queued" || q.state.data.status === "submitted") ? 1_000 : false),
  });
}

export function useHbarOrder(id: string | null) {
  const signedIn = useSignedIn();
  return useQuery({
    queryKey: HEDERA_KEYS.order(id ?? ""),
    queryFn: () => getHbarOrder(id ?? ""),
    enabled: !!id && signedIn,
    retry: false,
    refetchInterval: (q) => {
      const o = q.state.data;
      if (!o) return false;
      const moving =
        (o.status === "awaiting" && o.paidHbar !== null) ||
        o.mint === "queued" ||
        o.mint === "submitted" ||
        o.refund?.status === "pending";
      // Awaiting payment, nothing sent yet: once a second, so the expiry turns over on time.
      return moving ? 1_200 : o.status === "awaiting" ? 1_000 : false;
    },
  });
}

export function usePrizes() {
  return useQuery({
    queryKey: HEDERA_KEYS.prizes,
    queryFn: getPrizes,
    enabled: useSignedIn(),
    // Watched while something moves on its own: an identity check being reviewed, a payout being approved.
    refetchInterval: (q) => (q.state.data?.some((p) => p.status === "pending" || p.status === "reviewing") ? 3_000 : false),
  });
}

export function useHederaActivity() {
  return useQuery({ queryKey: HEDERA_KEYS.activity, queryFn: getHederaActivity, enabled: useSignedIn() });
}

/** After a link, a claim or a payment: every Hedera read again. */
export function useRefreshHedera() {
  const client = useQueryClient();
  return useCallback(() => client.invalidateQueries({ queryKey: HEDERA_KEYS.all }), [client]);
}
