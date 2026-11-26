import { ExternalLink, Globe, Loader2, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { clsx as cn } from "clsx";

import { CTA, QUIET, TEXT_LINK, TILE } from "@/components/hedera/styles";
import { BracketButton } from "@/components/ui/BracketButton";
import { estimateHbar, hashscanUrl } from "@/lib/api/hedera";
import { formatFiat, formatHbar } from "@/lib/hedera/format";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { AssetRarity, HederaAsset } from "@/types/hedera";

/*
 * `clsx`, NOT `cn`, IN THIS SECTION: `cn` is tailwind-merge with no knowledge
 * of the site's own size tokens, so it reads `text-body` and `text-body-sm` as
 * colours and drops whichever colour class sits beside them (the Chip bug of
 * 2026-09-26). Nothing here relies on merging, so plain joining is safe.
 */

/** Something under way: a wallet step, a mint, a payment being confirmed. `light` on the paper sheets. */
export function Busy({ children, tone = "dark", className }: { children: ReactNode; tone?: "dark" | "light"; className?: string }) {
  return (
    <p role="status" className={cn(tone === "dark" ? "text-menu-fg" : "text-ink", "font-body text-body flex items-center gap-3", className)}>
      <Loader2 aria-hidden className="size-5 shrink-0 animate-spin motion-reduce:animate-none" strokeWidth={1.75} />
      {children}
    </p>
  );
}

/** A step that stopped: the player said no, or something didn't answer. */
export function Stopped({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p role="alert" className={cn("text-signal font-body text-body-sm leading-snug", className)}>
      {children}
    </p>
  );
}

/** The doc's rule for every wallet screen: say what is public on the chain. */
export function PublicNote({ messages, className }: { messages: Messages; className?: string }) {
  return (
    <p className={cn(QUIET, "flex gap-2.5", className)}>
      <Globe aria-hidden className="mt-px size-4 shrink-0" strokeWidth={1.75} />
      {messages.hedera.publicNote}
    </p>
  );
}

export function HashscanLink({
  kind,
  value,
  label,
  tone = "dark",
  className,
}: {
  kind: "transaction" | "account" | "token";
  value: string;
  label: string;
  /** `light` on the paper sheets. */
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <a
      href={hashscanUrl(kind, value)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(tone === "dark" ? TEXT_LINK : TEXT_LINK.replace("text-menu-fg", "text-ink"), "inline-flex items-center gap-1.5", className)}
    >
      {label}
      <ExternalLink aria-hidden className="size-3.5" strokeWidth={1.75} />
    </a>
  );
}

/** A state that interrupts a screen: no wallet, the service down, an order not found. */
export function Notice({
  icon: Icon,
  title,
  body,
  cta,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  cta?: { href: string; label: string };
  /** A second action that isn't a link: TRY AGAIN. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(TILE, "flex flex-col gap-5 px-6 py-7 md:flex-row md:items-start md:gap-7 md:px-8", className)}>
      <span className="bg-gild grid size-11 shrink-0 place-items-center rounded-sm">
        <Icon aria-hidden className="text-ink size-5.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-menu-fg text-[1.75rem] leading-none font-semibold tracking-[-0.03em] uppercase">{title}</h2>
        <div className="text-menu-fg/85 font-body text-body mt-2.5 max-w-[36rem]">{body}</div>
        {cta || action ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
            {cta ? (
              <BracketButton href={cta.href} className={CTA}>
                {cta.label}
              </BracketButton>
            ) : null}
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The ground behind an exclusive's art, by rarity, from tokens the site
 * already has. No frame says which colour a rarity is. FLAGGED.
 */
const RARITY_FIELD: Record<AssetRarity, string> = {
  common: "bg-ash",
  rare: "bg-slate",
  epic: "bg-clot",
  legendary: "bg-gold-mid",
};

export function AssetArt({
  asset,
  sizes,
  priority = false,
  className,
}: {
  asset: Pick<HederaAsset, "image" | "imageAlt" | "rarity">;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-lg", RARITY_FIELD[asset.rarity], className)}>
      <Image
        src={asset.image}
        alt={asset.imageAlt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </div>
  );
}

/** "Epic · Skin". */
export function AssetKind({ asset, messages, className }: { asset: HederaAsset; messages: Messages; className?: string }) {
  const t = messages.hedera;
  return (
    <p className={cn("text-menu-fg/70 font-body text-body-sm leading-none", className)}>
      {t.rarity[asset.rarity]} · {t.family[asset.family]}
    </p>
  );
}

/**
 * A price on the shelf: the HBAR estimate first, the naira it's set in after.
 * The exact HBAR is quoted at checkout. A free exclusive says FREE.
 */
export function AssetPrice({
  asset,
  messages,
  locale,
  size = "md",
}: {
  asset: HederaAsset;
  messages: Messages;
  locale: Locale;
  size?: "md" | "lg";
}) {
  const t = messages.hedera;
  const big = size === "lg" ? "text-[2.75rem] tracking-[-0.04em]" : "text-[1.625rem] tracking-[-0.03em]";
  if (!asset.price) {
    return (
      <div>
        <p className={cn("font-display text-menu-fg leading-none font-semibold", big)}>{t.store.free}</p>
        <p className={cn(QUIET, "mt-1.5")}>{t.store.freeNote}</p>
      </div>
    );
  }
  return (
    <div>
      <p className={cn("font-display text-menu-fg leading-none font-semibold", big)}>{formatHbar(estimateHbar(asset.price), messages)}</p>
      <p className={cn(QUIET, "mt-1.5")}>{t.approx.replace("{amount}", formatFiat(asset.price, locale, messages))}</p>
    </div>
  );
}
