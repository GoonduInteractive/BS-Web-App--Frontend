"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ClaimDialog } from "@/components/hedera/ClaimDialog";
import { Busy, HashscanLink } from "@/components/hedera/bits";
import { CTA, QUIET } from "@/components/hedera/styles";
import { BracketButton } from "@/components/ui/BracketButton";
import { useHoldings, useWalletLink } from "@/hooks/useHedera";
import { holdingOf } from "@/lib/hedera/exclusives";
import { connectHref } from "@/lib/hedera/links";
import { authHref } from "@/lib/utils/auth-links";
import type { Messages } from "@/lib/utils/messages";
import type { HederaAsset } from "@/types/hedera";

/**
 * What the player can do with an exclusive (the doc's screen 9 states: for
 * sale, claimable, owned, sold out), decided in the browser because the page
 * is static: sign in, link a wallet, buy, claim, or nothing - it's theirs, or
 * there are none left.
 */
export function AssetActions(props: { asset: HederaAsset; messages: Messages; locale: string }) {
  const [claiming, setClaiming] = useState(false);
  // THE SHEET OUTLIVES THE BUTTON THAT OPENED IT: a claim puts the exclusive in the wallet
  // mid-way, which swaps CLAIM for "minting" and then "owned" - the sheet has to stay to say
  // "it's yours".
  return (
    <>
      <Action {...props} onClaim={() => setClaiming(true)} />
      {props.asset.access === "free" ? (
        <ClaimDialog asset={props.asset} open={claiming} onClose={() => setClaiming(false)} messages={props.messages} />
      ) : null}
    </>
  );
}

function Action({
  asset,
  messages,
  locale,
  onClaim,
}: {
  asset: HederaAsset;
  messages: Messages;
  locale: string;
  onClaim: () => void;
}) {
  const t = messages.hedera.asset;
  const pathname = usePathname();
  const { status } = useAuth();
  const link = useWalletLink();
  const holdings = useHoldings();

  const free = asset.access === "free";
  const checkout = `/${locale}/hedera/checkout?asset=${encodeURIComponent(asset.id)}`;
  // A sale window that has closed is the checkout's to refuse: the clock isn't read while rendering a static page.
  const soldOut = asset.supply?.remaining === 0;

  if (!free && soldOut) return <p className="text-menu-fg/85 font-body text-body">{t.soldOut}</p>;

  if (status === "signed-out") {
    return (
      <BracketButton href={authHref(locale, "sign-in", pathname)} className={CTA}>
        {free ? t.signInToClaim : t.signInToBuy}
      </BracketButton>
    );
  }
  if (status === "loading" || link.isPending) return <div aria-busy className="h-15" />;

  if (!link.data) {
    return (
      <BracketButton href={connectHref(locale, free ? pathname : checkout)} className={CTA}>
        {free ? t.linkToClaim : t.linkToBuy}
      </BracketButton>
    );
  }

  const held = holdingOf(asset.id, holdings.data);
  if (held?.status === "minting") return <Busy>{t.minting}</Busy>;
  if (held) {
    return (
      <div>
        <p className="text-menu-fg font-body text-body">{t.owned}</p>
        {held.serial !== null ? <p className={`${QUIET} mt-1.5`}>{t.serial.replace("{n}", String(held.serial))}</p> : null}
        <HashscanLink kind="token" value={held.tokenId} label={messages.hedera.viewOnHashscan} className="mt-4" />
      </div>
    );
  }

  if (free) {
    return (
      <BracketButton onClick={onClaim} className={CTA}>
        {t.claim}
      </BracketButton>
    );
  }

  return (
    <div>
      <BracketButton href={checkout} className={CTA}>
        {t.buy}
      </BracketButton>
      <p className={`${QUIET} mt-4`}>{t.estimate}</p>
    </div>
  );
}
