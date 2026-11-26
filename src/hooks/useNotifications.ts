"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthProvider";
import { getMyNotifications } from "@/lib/api/notifications";

/** The cache key for the signed-in player's notifications. */
export const MY_NOTIFICATIONS = ["player", "notifications"] as const;

/**
 * The signed-in player's latest notifications and unread count. Read again
 * every minute while the tab is in view, and when the player comes back to it.
 */
export function useMyNotifications() {
  const { status } = useAuth();
  return useQuery({
    queryKey: MY_NOTIFICATIONS,
    queryFn: getMyNotifications,
    enabled: status === "signed-in",
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}
