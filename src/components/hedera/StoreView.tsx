"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AssetCard } from "@/components/hedera/AssetCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHoldings } from "@/hooks/useHedera";
import { holdingOf } from "@/lib/hedera/exclusives";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { ASSET_FAMILIES, ASSET_RARITIES, type AssetFamily, type AssetRarity, type HederaAsset } from "@/types/hedera";

/**
 * The game store's shelf (the doc's screen 7): every exclusive, filtered by
 * family and rarity, HBAR first with the naira it's set in. Anyone can browse;
 * buying needs a sign-in and a wallet (the exclusive's own page says which).
 * Signed in with a wallet, what the player already holds says OWNED.
 */
export function StoreView({ catalogue, messages, locale }: { catalogue: readonly HederaAsset[]; messages: Messages; locale: Locale }) {
  const t = messages.hedera;
  const { status } = useAuth();
  const holdings = useHoldings();
  const [family, setFamily] = useState<AssetFamily | null>(null);
  const [rarity, setRarity] = useState<AssetRarity | null>(null);

  const shown = catalogue.filter((a) => (!family || a.family === family) && (!rarity || a.rarity === rarity));

  return (
    <div>
      {status === "signed-out" ? <p className="text-menu-fg/85 font-body text-body-sm -mt-4 mb-8">{t.store.signedOut}</p> : null}

      <div className="flex flex-col gap-4">
        <FilterGroup
          label={t.store.filterFamily}
          all={t.store.all}
          options={ASSET_FAMILIES.map((f) => ({ value: f, label: t.families[f] }))}
          value={family}
          onChange={setFamily}
        />
        <FilterGroup
          label={t.store.filterRarity}
          all={t.store.all}
          options={ASSET_RARITIES.map((r) => ({ value: r, label: t.rarity[r] }))}
          value={rarity}
          onChange={setRarity}
        />
      </div>

      {shown.length ? (
        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((asset, i) => (
            <li key={asset.id}>
              <AssetCard
                asset={asset}
                messages={messages}
                locale={locale}
                priority={i < 4}
                badge={holdingOf(asset.id, holdings.data) ? t.store.owned : null}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={SearchX} title={t.store.empty.title} body={t.store.empty.body} className="pt-16" />
      )}
    </div>
  );
}

function FilterGroup<V extends string>({
  label,
  all,
  options,
  value,
  onChange,
}: {
  label: string;
  all: string;
  options: readonly { value: V; label: string }[];
  value: V | null;
  onChange: (value: V | null) => void;
}) {
  const chip = (active: boolean) =>
    `font-body focus-visible:outline-signal h-9 cursor-pointer rounded-md border px-3.5 text-body-sm leading-none transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2 ${
      active ? "bg-menu-fg border-menu-fg text-ink" : "border-menu-fg/35 text-menu-fg hover:bg-menu-fg/10"
    }`;
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2.5">
      <span className="text-menu-fg/60 font-body text-body-sm mr-2 w-16 shrink-0">{label}</span>
      <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={chip(value === null)}>
        {all}
      </button>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className={chip(value === o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
