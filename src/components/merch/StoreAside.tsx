"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { LoginCard } from "@/components/merch/LoginCard";
import { PointsPanel } from "@/components/merch/PointsPanel";
import { useMyProfile } from "@/hooks/useMyProfile";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The store's right column, by who is looking: the login offer when signed
 * out, their points when signed in. Decided in the browser, where the session
 * is - the page is built once for everyone (`revalidate`). Nothing shows while
 * the session is read, so a signed-in player never sees the offer flash.
 *
 * The points are the profile's claimable points. FLAGGED: the API has no tiers
 * or perks, so there is no progress bar and no perk list.
 */
export function StoreAside({
  messages,
  locale,
}: {
  messages: Messages;
  locale: Locale;
}) {
  const { status } = useAuth();
  const profile = useMyProfile();

  if (status === "loading") return null;
  if (status === "signed-out") return <LoginCard messages={messages} locale={locale} />;

  if (!profile.data) return null;
  return <PointsPanel balance={{ points: profile.data.claimablePoints, perkKeys: [] }} messages={messages} />;
}
