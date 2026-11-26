"use client";

import { Gem, Wallet } from "lucide-react";
import { useState } from "react";

import { AssetCard } from "@/components/hedera/AssetCard";
import { ClaimDialog } from "@/components/hedera/ClaimDialog";
import { Busy, Notice } from "@/components/hedera/bits";
import { OUTLINE_BUTTON, PANEL_TITLE } from "@/components/hedera/styles";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCatalogue, useHoldings, useWalletLink } from "@/hooks/useHedera";
import { splitExclusives } from "@/lib/hedera/exclusives";
import { connectHref } from "@/lib/hedera/links";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { HederaAsset } from "@/types/hedera";

/**
 * My exclusives (the doc's screen 8): what's in the linked wallet - minting
 * ones say so - and the free exclusives waiting to be claimed. States: owned,
 * claimable, empty, and no wallet yet.
 */
export function MyExclusives({ messages, locale }: { messages: Messages; locale: Locale }) {
  const t = messages.hedera.exclusives;
  const link = useWalletLink();
  const holdings = useHoldings();
  const catalogue = useCatalogue();
  const [claiming, setClaiming] = useState<HederaAsset | null>(null);

  if (link.isPending || catalogue.isPending) return <div aria-busy className="h-64" />;

  if (!link.data) {
    const n = messages.hedera.hub.noWallet;
    return <Notice icon={Wallet} title={n.title} body={n.body} cta={{ href: connectHref(locale, `/${locale}/hedera/exclusives`), label: n.cta }} />;
  }

  const { held, claimable } = splitExclusives(catalogue.data ?? [], holdings.data);

  if (holdings.isSuccess && !held.length && !claimable.length) {
    return <EmptyState icon={Gem} title={t.empty.title} body={t.empty.body} cta={{ href: `/${locale}/hedera/store`, label: t.empty.cta }} className="pt-10" />;
  }

  return (
    <div className="flex flex-col gap-16">
      {held.length ? (
        <section>
          <h2 className={PANEL_TITLE}>{t.owned}</h2>
          <ul className="mt-7 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {held.map(({ asset, held: h }) => (
              <li key={asset.id}>
                <AssetCard asset={asset} messages={messages} locale={locale} badge={messages.hedera.store.owned}>
                  {h.status === "minting" ? <Busy>{messages.hedera.asset.minting}</Busy> : null}
                </AssetCard>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {claimable.length ? (
        <section>
          <h2 className={PANEL_TITLE}>{t.claimable}</h2>
          <ul className="mt-7 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {claimable.map((asset) => (
              <li key={asset.id}>
                <AssetCard asset={asset} messages={messages} locale={locale}>
                  <button type="button" onClick={() => setClaiming(asset)} className={OUTLINE_BUTTON}>
                    {messages.hedera.asset.claim}
                  </button>
                </AssetCard>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {claiming ? <ClaimDialog asset={claiming} open onClose={() => setClaiming(null)} messages={messages} /> : null}
    </div>
  );
}
