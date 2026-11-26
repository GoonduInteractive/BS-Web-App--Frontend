import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { AssetActions } from "@/components/hedera/AssetActions";
import { AssetArt, AssetKind, AssetPrice, HashscanLink, PublicNote } from "@/components/hedera/bits";
import { HederaFrame } from "@/components/hedera/HederaFrame";
import { QUIET, TEXT_LINK } from "@/components/hedera/styles";
import { getAsset, getCatalogue } from "@/lib/api/hedera";
import { formatDay } from "@/lib/hedera/format";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * One exclusive (the doc's screen 9): its art, family and rarity, which games
 * use it, its collection on HashScan, and what the visitor can do with it.
 */
export async function generateStaticParams() {
  const catalogue = await getCatalogue();
  return LOCALES.flatMap((locale) => catalogue.map((a) => ({ locale, assetId: a.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; assetId: string }> }): Promise<Metadata> {
  const { locale, assetId } = await params;
  if (!isLocale(locale)) return {};
  const asset = await getAsset(assetId);
  if (!asset) return {};
  return pageMetadata({ locale, path: `/hedera/store/${asset.id}`, title: asset.name, description: asset.description, image: asset.image, imageAlt: asset.imageAlt });
}

export default async function Page({ params }: { params: Promise<{ locale: string; assetId: string }> }) {
  const { locale, assetId } = await params;
  if (!isLocale(locale)) notFound();
  const asset = await getAsset(assetId);
  if (!asset) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;
  const t = messages.hedera;
  const soldOut = asset.supply?.remaining === 0;

  return (
    <HederaFrame messages={messages} locale={locale} title={t.store.title}>
      <Link href={`/${locale}/hedera/store`} className={`${TEXT_LINK} inline-flex items-center gap-2 no-underline`}>
        <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
        {t.asset.back}
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-14 lg:gap-20">
        <AssetArt asset={asset} sizes="(max-width: 767px) 90vw, 26rem" priority />

        <div className="min-w-0">
          <AssetKind asset={asset} messages={messages} />
          <h2 className="font-display text-menu-fg text-section-heading mt-4 font-semibold tracking-[-0.058em] uppercase">{asset.name}</h2>
          <p className="text-menu-fg/85 font-body text-body mt-4 max-w-[34rem]">{asset.description}</p>

          <div className="mt-8">
            <AssetPrice asset={asset} messages={messages} locale={locale} size="lg" />
            {soldOut ? (
              <p className="text-signal font-display mt-3 text-[1.25rem] leading-none font-semibold tracking-[0.04em]">{t.store.soldOut}</p>
            ) : asset.supply ? (
              <p className={`${QUIET} mt-3`}>{t.store.left.replace("{remaining}", String(asset.supply.remaining)).replace("{total}", String(asset.supply.total))}</p>
            ) : asset.saleEndsAt ? (
              <p className={`${QUIET} mt-3`}>{t.store.until.replace("{date}", formatDay(asset.saleEndsAt))}</p>
            ) : null}
          </div>

          <div className="mt-9">
            <AssetActions asset={asset} messages={messages} locale={locale} />
          </div>

          <dl className="border-menu-fg/12 mt-10 grid max-w-[34rem] grid-cols-1 gap-5 border-t pt-8 sm:grid-cols-2">
            <div>
              <dt className={QUIET}>{t.asset.games}</dt>
              <dd className="text-menu-fg font-body text-body mt-1.5">{asset.games.join(", ")}</dd>
            </div>
            <div>
              <dt className={QUIET}>{t.asset.collection}</dt>
              <dd className="mt-1.5">
                <HashscanLink kind="token" value={asset.tokenId} label={asset.tokenId} />
              </dd>
            </div>
          </dl>
          <PublicNote messages={messages} className="mt-8 max-w-[34rem]" />
        </div>
      </div>
    </HederaFrame>
  );
}
