"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthProvider";
import { getMyRewardCodes, getMySeeds, getRewardTiers } from "@/lib/api/seeds";

/** The cache key for the signed-in player's Seeds; whatever earns or spends them invalidates it. */
export const MY_SEEDS = ["player", "seeds"] as const;

/** The signed-in player's Seeds. Idle while nobody is signed in. */
export function useMySeeds() {
  const { status } = useAuth();
  return useQuery({ queryKey: MY_SEEDS, queryFn: getMySeeds, enabled: status === "signed-in" });
}

/** The store discounts Seeds buy. They change rarely, so they're read once a visit. */
export function useRewardTiers() {
  const { status } = useAuth();
  return useQuery({
    queryKey: ["rewards", "tiers"],
    queryFn: getRewardTiers,
    enabled: status === "signed-in",
    staleTime: Infinity,
  });
}

/** The cache key for the player's reward codes; redeeming and checking out invalidate it. */
export const MY_CODES = ["player", "reward-codes"] as const;

/** The discount codes the signed-in player has bought with Seeds, newest first. */
export function useMyRewardCodes() {
  const { status } = useAuth();
  return useQuery({ queryKey: MY_CODES, queryFn: getMyRewardCodes, enabled: status === "signed-in" });
}
