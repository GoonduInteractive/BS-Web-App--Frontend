"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthProvider";
import { getMyProfile } from "@/lib/api/player";

/** The cache key for the signed-in player's profile; saving it invalidates this. */
export const MY_PROFILE = ["player", "profile"] as const;

/**
 * The signed-in player's profile, read in the browser. Idle while nobody is
 * signed in.
 */
export function useMyProfile() {
  const { status } = useAuth();
  return useQuery({ queryKey: MY_PROFILE, queryFn: getMyProfile, enabled: status === "signed-in" });
}
