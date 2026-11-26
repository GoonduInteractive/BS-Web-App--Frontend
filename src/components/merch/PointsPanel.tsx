"use client";

import { Copy } from "lucide-react";
import Image from "next/image";

import { SeedIcon } from "@/components/ui/CurrencyIcons";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { formatPrice } from "@/lib/utils/price";
import type { RewardCode, RewardTier, SeedsBalance } from "@/types/seeds";

/** How many codes the panel lists: the ones still to use come first. */
const CODES_SHOWN = 4;

const count = (n: number) => new Intl.NumberFormat("en-NG").format(n);

/** The cheapest reward the Calabash doesn't reach yet; past the dearest there's none. */
export const nextRewardAt = (tiers: readonly RewardTier[], points: number) => tiers.find((tier) => tier.cost > points)?.cost;

/**
 * The store's Seeds column for a signed-in player. Figma: `Merch Store-
 * logged in.png` (CLAIMABLE POINTS over POINT PERKS), now in the game's
 * words: the Calabash, what the player can spend, with the bar to the next
 * reward; then every reward, its cost and a REDEEM for the ones the Calabash
 * reaches; then the codes they've bought.
 *
 * Past the frame: the Legacy and on-hold line under the bar, REDEEM and the
 * costs on the reward rows, and YOUR CODES. No frame draws those; they're
 * built from the panel's own type, ground and red arrows.
 *
 * The rewards and the codes are their own pieces (`RewardsList`, `CodesList`,
 * `NextRewardBar`), so the Calabash (`components/calabash/Calabash.tsx`) lays
 * the same rows out its own way.
 */
export function PointsPanel({
  seeds,
  tiers,
  codes,
  messages,
  locale,
  onRedeem,
  className = "lg:ml-4.5",
}: {
  seeds: SeedsBalance;
  /** Cheapest first. */
  tiers: readonly RewardTier[];
  /** Newest first. */
  codes: readonly RewardCode[];
  messages: Messages;
  locale: Locale;
  onRedeem: (tier: RewardTier) => void;
  /** Its outer spacing: the store column's offset by default. */
  className?: string;
}) {
  const t = messages.merch.points;
  const points = seeds.calabash;
  const hasCodes = codes.length > 0;

  return (
    <div className={className}>
      {/* ---- The usable Seeds, what's in the Calabash (the wallet) ---- */}
      <section className="bg-ash relative px-6.5 pt-8.75 pb-9">
        <h2 className="text-menu-fg/85 font-body text-[1.1875rem] leading-none tracking-wider">{t.claimable}</h2>

        <span className="bg-gild absolute top-8.25 right-8.25 grid size-9.5 place-items-center">
          <SeedIcon className="text-ink size-5.5" />
        </span>

        <p className="mt-4.5 flex items-baseline gap-2.5">
          <span className="font-display text-menu-fg text-[4.5rem] leading-none font-semibold tracking-normal">{points}</span>
          <span className="font-display text-menu-fg text-[2.0625rem] leading-none font-semibold tracking-[-0.02em]">{t.unit}</span>
        </p>

        <NextRewardBar tiers={tiers} points={points} messages={messages} className="mt-6.75" />

        {seeds.legacy > 0 || seeds.pending > 0 ? (
          <p className="text-menu-fg/60 font-body mt-4.5 text-[0.8125rem] leading-snug">
            {t.legacy.replace("{count}", count(seeds.legacy))}
            {seeds.pending > 0 ? ` · ${t.pending.replace("{count}", count(seeds.pending))}` : null}
          </p>
        ) : null}
      </section>

      {/* ---- The rewards ---- */}
      <section className="bg-ash mt-11 px-6.5 pt-8.75 pb-8.5 lg:min-h-71.25">
        <h2 className="text-menu-fg/85 font-body text-[1.1875rem] leading-none tracking-wider">{t.perksTitle}</h2>
        <RewardsList tiers={tiers} points={points} messages={messages} locale={locale} onRedeem={onRedeem} className="mt-6" />
      </section>

      {/* ---- The codes bought ---- */}
      {hasCodes ? (
        <section className="bg-ash mt-11 px-6.5 pt-8.75 pb-8">
          <h2 className="text-menu-fg/85 font-body text-[1.1875rem] leading-none tracking-wider">{t.codesTitle}</h2>
          <CodesList codes={codes} messages={messages} className="mt-5.5" />
        </section>
      ) : null}
    </div>
  );
}

/** The bar to the next reward and the Seeds still to go. Past the dearest reward there is no next one: nothing. */
export function NextRewardBar({
  tiers,
  points,
  messages,
  className,
}: {
  tiers: readonly RewardTier[];
  points: number;
  messages: Messages;
  className?: string;
}) {
  const t = messages.merch.points;
  const next = nextRewardAt(tiers, points);
  if (next == null) return null;

  return (
    <div className={className}>
      <div role="progressbar" aria-valuenow={points} aria-valuemin={0} aria-valuemax={next} className="bg-menu-fg/70 h-1.5 w-[96.5%]">
        <div className="bg-crimson h-full" style={{ width: `${next > 0 ? Math.min(100, Math.max(0, (points / next) * 100)) : 0}%` }} />
      </div>
      <p className="text-menu-fg font-body text-body mt-3.25 leading-none">{t.next.replace("{count}", count(Math.max(0, next - points)))}</p>
    </div>
  );
}

/** Every reward, its cost and cap, with REDEEM on the ones the Calabash reaches. */
export function RewardsList({
  tiers,
  points,
  messages,
  locale,
  onRedeem,
  className,
}: {
  tiers: readonly RewardTier[];
  points: number;
  messages: Messages;
  locale: Locale;
  onRedeem: (tier: RewardTier) => void;
  className?: string;
}) {
  const t = messages.merch.points;
  if (!tiers.length) return <p className={cn("text-menu-fg font-body text-body max-w-[85%]", className)}>{points > 0 ? t.more : t.none}</p>;

  return (
    <div className={className}>
      <ul className="flex flex-col gap-5.5">
        {tiers.map((tier) => {
          const reached = tier.cost <= points;
          return (
            <li key={`${tier.discountPct}-${tier.cost}`} className={cn("flex items-center gap-2.5", !reached && "opacity-55")}>
              <Image src="/assets/merch/red-arrow.svg" alt="" aria-hidden width={23} height={28} className="h-[27.77px] w-[22.86px] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-menu-fg font-body text-body leading-snug">{tier.name}</p>
                <p className="text-menu-fg/60 font-body mt-1 text-[0.8125rem] leading-snug">
                  {t.cost.replace("{count}", count(tier.cost))}
                  {tier.capNaira > 0 ? ` · ${t.cap.replace("{amount}", formatPrice(tier.capNaira, locale, messages.merch.price))}` : null}
                </p>
              </div>
              {reached ? (
                <button
                  type="button"
                  onClick={() => onRedeem(tier)}
                  aria-label={t.redeemLabel.replace("{reward}", tier.name).replace("{count}", count(tier.cost))}
                  className="border-menu-fg/90 text-menu-fg font-body hover:bg-menu-fg/10 focus-visible:outline-signal h-8.5 shrink-0 cursor-pointer border px-3 text-[0.8125rem] leading-none font-semibold tracking-wider transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t.redeem}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {points < (tiers.at(-1)?.cost ?? 0) ? <p className="text-menu-fg font-body text-body mt-9 leading-snug">{points > 0 ? t.more : t.none}</p> : null}
    </div>
  );
}

/** The codes bought, the ones still to use first, each with a copy button. */
export function CodesList({ codes, messages, className }: { codes: readonly RewardCode[]; messages: Messages; className?: string }) {
  const t = messages.merch.points;
  const shown = [...codes.filter((c) => c.usable), ...codes.filter((c) => !c.usable)].slice(0, CODES_SHOWN);
  const copy = (code: string) => {
    void navigator.clipboard
      ?.writeText(code)
      .then(() => toast(t.copied))
      .catch(() => {});
  };
  if (!shown.length) return null;

  return (
    <ul className={cn("flex flex-col", className)}>
      {shown.map((c) => (
        <li key={c.id} className={cn("border-menu-fg/15 flex items-center gap-3 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0", !c.usable && "opacity-55")}>
          <div className="min-w-0 flex-1">
            <p className="font-display text-menu-fg text-[1.375rem] leading-none font-semibold tracking-[0.04em] break-all uppercase">{c.code}</p>
            <p className="text-menu-fg/60 font-body mt-1.5 text-[0.8125rem] leading-none">
              {t.codeOff.replace("{pct}", String(c.discountPct))} · {c.usable ? t.codeReady : t.codeUsed}
            </p>
          </div>
          {c.usable ? (
            <button
              type="button"
              onClick={() => copy(c.code)}
              aria-label={`${t.copy}: ${c.code}`}
              title={t.copy}
              className="text-menu-fg/85 hover:text-menu-fg focus-visible:outline-signal grid size-8.5 shrink-0 cursor-pointer place-items-center transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Copy aria-hidden className="size-4.5" strokeWidth={1.75} />
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
