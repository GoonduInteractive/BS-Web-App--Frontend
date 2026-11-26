"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { useState } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { SeedIcon } from "@/components/ui/CurrencyIcons";
import { TornDialog } from "@/components/ui/TornDialog";
import { toast } from "@/components/ui/Toaster";
import { MY_PROFILE } from "@/hooks/useMyProfile";
import { MY_CODES, MY_SEEDS } from "@/hooks/useSeeds";
import { ApiError } from "@/lib/api/client";
import { redeemReward } from "@/lib/api/seeds";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { formatPrice } from "@/lib/utils/price";
import type { RewardTier } from "@/types/seeds";

const count = (n: number) => new Intl.NumberFormat("en-NG").format(n);

/** A key for one redeem the player means: retrying it can't pay twice. */
const newAttempt = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Redeeming a reward, on the order confirmation's torn white sheet
 * (`Success modal.png`): first what it costs and what it gives, then the
 * code, to copy, and what's left in the Calabash. The disc is the points
 * tile's gold Nsibidi while asking, the signal tick once it's done.
 *
 * Render it with `key` per opening, so each opening is one attempt.
 */
export function RedeemDialog({
  tier,
  messages,
  locale,
  onClose,
}: {
  tier: RewardTier | null;
  messages: Messages;
  locale: Locale;
  onClose: () => void;
}) {
  const t = messages.merch.points;
  const d = t.dialog;
  const queries = useQueryClient();
  const [attempt] = useState(newAttempt);

  const redeem = useMutation({
    mutationFn: (pct: number) => redeemReward(pct, attempt),
    onSuccess: () => {
      void queries.invalidateQueries({ queryKey: MY_SEEDS });
      void queries.invalidateQueries({ queryKey: MY_CODES });
      void queries.invalidateQueries({ queryKey: MY_PROFILE });
    },
  });

  if (!tier) return null;
  const amount = formatPrice(tier.capNaira, locale, messages.merch.price);
  const fill = (s: string) => s.replace("{reward}", tier.name).replace("{count}", count(tier.cost)).replace("{pct}", String(tier.discountPct)).replace("{amount}", amount);
  const done = redeem.data;
  const error = !redeem.error
    ? null
    : redeem.error instanceof ApiError && redeem.error.status === 0
      ? messages.auth.errors.network
      : redeem.error instanceof ApiError && redeem.error.status >= 400 && redeem.error.status < 500
        ? d.short
        : messages.auth.errors.unknown;

  const copy = (code: string) => {
    void navigator.clipboard
      ?.writeText(code)
      .then(() => toast(t.copied))
      .catch(() => {});
  };

  return (
    <TornDialog
      open
      onClose={onClose}
      label={d.label}
      closeLabel={d.close}
      maxWidthClassName="max-w-[43.6875rem]"
      className="flex flex-col items-center px-6 pt-16.75 pb-15.5 text-center"
    >
      {done ? (
        <span aria-hidden className="bg-signal grid size-31 shrink-0 place-items-center rounded-full">
          <svg viewBox="0 0 44 34" className="text-menu-fg w-11" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18l12 12L40 5" />
          </svg>
        </span>
      ) : (
        <span aria-hidden className="bg-gild grid size-31 shrink-0 place-items-center rounded-full">
          <SeedIcon className="text-ink size-14" />
        </span>
      )}

      <h2 className="font-display text-ink mt-6.5 max-w-135 text-[2.25rem] leading-none font-semibold tracking-[-0.04em] uppercase sm:text-[2.9375rem]">
        {done ? d.doneTitle : fill(d.title)}
      </h2>

      {done ? (
        <>
          <div className="border-ink/30 mt-6 flex max-w-full items-center gap-3 border-2 border-dashed py-3 pr-3 pl-6">
            <span className="font-display text-ink text-[2.25rem] leading-none font-semibold tracking-[0.06em] break-all uppercase select-all">
              {done.code}
            </span>
            <button
              type="button"
              onClick={() => copy(done.code)}
              aria-label={`${t.copy}: ${done.code}`}
              title={t.copy}
              className="text-ink/70 hover:text-ink focus-visible:outline-signal grid size-10 shrink-0 cursor-pointer place-items-center transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Copy aria-hidden className="size-5" strokeWidth={1.75} />
            </button>
          </div>
          <p className="text-ink font-body text-body mt-5 max-w-135 leading-[1.5625rem]">
            {d.doneBody.replace("{pct}", String(done.discountPct)).replace("{amount}", amount).replace("{count}", count(done.calabash))}
          </p>
          <div className="mt-6.25">
            <BracketButton type="button" onClick={onClose} field="light" className="bg-ink text-body px-4.75 py-[1.15rem] tracking-normal">
              {d.done}
            </BracketButton>
          </div>
        </>
      ) : (
        <>
          <p className="text-ink font-body text-body mt-4.5 max-w-135 leading-[1.5625rem]">{fill(d.body)}</p>
          <div className="mt-6.25">
            <BracketButton
              type="button"
              onClick={() => redeem.mutate(tier.discountPct)}
              disabled={redeem.isPending}
              aria-busy={redeem.isPending || undefined}
              field="light"
              className="bg-ink text-body px-4.75 py-[1.15rem] tracking-normal"
            >
              {d.confirm}
            </BracketButton>
          </div>
          {error ? (
            <p role="alert" className="text-signal font-body text-body-sm mt-3 leading-snug">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="text-ink font-body text-body-sm focus-visible:outline-signal mt-4 cursor-pointer underline underline-offset-4 transition-opacity duration-150 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {d.cancel}
          </button>
        </>
      )}
    </TornDialog>
  );
}
