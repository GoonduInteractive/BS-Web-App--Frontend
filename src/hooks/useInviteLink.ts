"use client";

import { useSyncExternalStore } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useMyProfile } from "@/hooks/useMyProfile";
import { inviteHref } from "@/lib/utils/invite";

/**
 * The signed-in player's invite link (`lib/utils/invite.ts`): their referral
 * code, and `region` (a slug) or else their own region. A visitor who isn't
 * signed in gets the region alone. Absolute on this site's own origin - read
 * in the browser, since the server's `SITE_URL` isn't there - and the path
 * alone in the first render, which the server drew.
 */
export function useInviteLink(locale: string, region?: string | null) {
  const { status } = useAuth();
  const me = useMyProfile();
  const origin = useSyncExternalStore(noSubscription, () => window.location.origin, () => "");

  const code = me.data?.referralCode || null;
  const href = inviteHref(locale, { code, region: region ?? me.data?.regionSlug ?? null });
  return {
    link: `${origin}${href}`,
    /**
     * Signed in with no code. Every account gets one at sign-up (its username,
     * generated when none is given: the backend, 2026-11-20), so this is only
     * for an account the API somehow sends without either.
     */
    needsUsername: status === "signed-in" && me.isSuccess && !code,
  };
}

const noSubscription = () => () => {};
