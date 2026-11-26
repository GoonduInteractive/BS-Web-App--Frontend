"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { LoginCard } from "@/components/merch/LoginCard";
import { PointsPanel } from "@/components/merch/PointsPanel";
import { RedeemDialog } from "@/components/merch/RedeemDialog";
import { useMyRewardCodes, useMySeeds, useRewardTiers } from "@/hooks/useSeeds";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { RewardTier } from "@/types/seeds";

/**
 * The store's right column, by who is looking: the login offer when signed
 * out, their Seeds when signed in. Decided in the browser, where the session
 * is - the page is built once for everyone (`revalidate`). Nothing shows while
 * the session is read, so a signed-in player never sees the offer flash.
 *
 * The Seeds are the Calabash, what a player can spend, against the API's
 * rewards; REDEEM opens `RedeemDialog`. Rewards or codes that fail to load
 * leave their part out rather than the balance.
 */
export function StoreAside({
  messages,
  locale,
}: {
  messages: Messages;
  locale: Locale;
}) {
  const { status } = useAuth();
  const seeds = useMySeeds();
  const tiers = useRewardTiers();
  const codes = useMyRewardCodes();
  // Each opening is one attempt: `key` starts the dialog afresh.
  const [redeeming, setRedeeming] = useState<{ tier: RewardTier; attempt: number } | null>(null);

  if (status === "loading") return null;
  if (status === "signed-out") return <LoginCard messages={messages} locale={locale} />;

  if (!seeds.data || tiers.isPending) return null;
  return (
    <>
      <PointsPanel
        seeds={seeds.data}
        tiers={tiers.data ?? []}
        codes={codes.data ?? []}
        messages={messages}
        locale={locale}
        onRedeem={(tier) => setRedeeming((r) => ({ tier, attempt: (r?.attempt ?? 0) + 1 }))}
      />
      {redeeming ? (
        <RedeemDialog
          key={redeeming.attempt}
          tier={redeeming.tier}
          messages={messages}
          locale={locale}
          onClose={() => setRedeeming(null)}
        />
      ) : null}
    </>
  );
}
