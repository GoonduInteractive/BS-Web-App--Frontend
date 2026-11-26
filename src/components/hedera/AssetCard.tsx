import Link from "next/link";
import type { ReactNode } from "react";

import { AssetArt, AssetKind, AssetPrice } from "@/components/hedera/bits";
import { QUIET } from "@/components/hedera/styles";
import { formatDay } from "@/lib/hedera/format";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { HederaAsset } from "@/types/hedera";

/**
 * One exclusive on a shelf: its art on its rarity's ground, the name, the kind
 * and the price - the merch store's `ProductCard` in this section's terms. The
 * card is a link to the exclusive; anything that acts (CLAIM) goes in
 * `children`, under the link rather than inside it.
 */
export function AssetCard({
  asset,
  messages,
  locale,
  badge,
  priority = false,
  children,
}: {
  asset: HederaAsset;
  messages: Messages;
  locale: Locale;
  /** A word on the art: SOLD OUT, OWNED. */
  badge?: string | null;
  priority?: boolean;
  children?: ReactNode;
}) {
  const t = messages.hedera.store;
  const soldOut = asset.supply?.remaining === 0;
  const note = soldOut
    ? null
    : asset.supply
      ? t.left.replace("{remaining}", String(asset.supply.remaining)).replace("{total}", String(asset.supply.total))
      : asset.saleEndsAt
        ? t.until.replace("{date}", formatDay(asset.saleEndsAt))
        : null;
  const shownBadge = badge ?? (soldOut ? t.soldOut : null);

  return (
    <div>
      <Link
        href={`/${locale}/hedera/store/${asset.id}`}
        className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className="relative">
          <AssetArt asset={asset} sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 23vw" priority={priority} />
          {shownBadge ? (
            <span className="bg-ink/85 text-menu-fg font-display absolute top-3 left-3 rounded-sm px-2.5 pt-1.5 pb-1 text-[0.9375rem] leading-none font-semibold tracking-[0.06em]">
              {shownBadge}
            </span>
          ) : null}
        </div>

        <h3 className="font-display text-menu-fg mt-5 text-[1.625rem] leading-none font-semibold tracking-[-0.04em] uppercase">
          {asset.name}
        </h3>
        <AssetKind asset={asset} messages={messages} className="mt-2" />
        {note ? <p className={`${QUIET} mt-1.5`}>{note}</p> : null}
        <div className="mt-4">
          <AssetPrice asset={asset} messages={messages} locale={locale} />
        </div>
      </Link>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
