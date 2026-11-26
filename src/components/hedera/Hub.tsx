"use client";

import { CloudOff, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Calabash } from "@/components/calabash/Calabash";
import { ActivityList } from "@/components/hedera/ActivityList";
import { AssetCard } from "@/components/hedera/AssetCard";
import { Notice } from "@/components/hedera/bits";
import { CalabashHbar } from "@/components/hedera/CalabashHbar";
import { OUTLINE_BUTTON, PANEL, PANEL_TITLE, QUIET, TEXT_LINK } from "@/components/hedera/styles";
import {
  useCatalogue,
  useHederaActivity,
  useHederaStatus,
  useHoldings,
  usePrizes,
} from "@/hooks/useHedera";
import { formatHbar } from "@/lib/hedera/format";
import { splitExclusives } from "@/lib/hedera/exclusives";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The Hedera hub (the doc's screen 2): the Calabash - the same as on the
 * profile, its HBAR tab holding the linked wallet - then the exclusives,
 * prizes and the latest activity. Three states: no wallet, wallet linked, and the Hedera
 * service down (the link is the website's and still shows; balances aren't).
 */
export function Hub({ messages, locale }: { messages: Messages; locale: Locale }) {
  const t = messages.hedera.hub;
  const status = useHederaStatus();
  const holdings = useHoldings();
  const catalogue = useCatalogue();
  const prizes = usePrizes();
  const activity = useHederaActivity();

  const down = status.data?.up === false || holdings.isError;
  const { held, claimable } = splitExclusives(catalogue.data ?? [], holdings.data);
  const shelf = [...held.map((h) => h.asset), ...claimable].slice(0, 4);
  // The first prize waiting on the player: an identity check to send, or to send again.
  const waiting = prizes.data?.find((p) => p.status === "resubmit") ?? prizes.data?.find((p) => p.status === "verify");

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {down ? (
        <Notice
          icon={CloudOff}
          title={messages.hedera.down.title}
          body={messages.hedera.down.body}
          action={
            <button
              type="button"
              onClick={() => {
                void status.refetch();
                void holdings.refetch();
              }}
              className={OUTLINE_BUTTON}
            >
              {messages.hedera.retry}
            </button>
          }
        />
      ) : null}

      {/* A prize waiting on the player's identity check: said first, and in the bell and by email too. */}
      {waiting ? (
        <Notice
          icon={ShieldAlert}
          title={waiting.status === "resubmit" ? messages.hedera.prize.resubmit.title : messages.hedera.prize.verify.title}
          body={t.identityNudge.replace("{amount}", formatHbar(waiting.hbar, messages)).replace("{tournament}", waiting.tournament)}
          action={
            <Link href={`/${locale}/hedera/prize?id=${encodeURIComponent(waiting.id)}`} className={OUTLINE_BUTTON}>
              {t.identityCta}
            </Link>
          }
        />
      ) : null}

      {/* ---- The Calabash: Usable Seeds, Legacy Seeds and HBAR on tabs, the same as on the profile
          (the human, 2026-11-23). The HBAR tab carries the linked wallet. ---- */}
      <Calabash messages={messages} locale={locale} framed hbar={<CalabashHbar messages={messages} locale={locale} />} />

      {/* ---- Exclusives ---- */}
      <section className={PANEL}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className={PANEL_TITLE}>{t.exclusives}</h2>
          <Link href={`/${locale}/hedera/exclusives`} className={TEXT_LINK}>
            {t.seeAll}
          </Link>
        </div>
        <p className="text-menu-fg/85 font-body text-body-sm mt-3">
          {t.exclusivesCount.replace("{owned}", String(held.length)).replace("{claimable}", String(claimable.length))}
        </p>
        {shelf.length ? (
          <ul className="mt-7 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {shelf.map((asset) => (
              <li key={asset.id}>
                <AssetCard
                  asset={asset}
                  messages={messages}
                  locale={locale}
                  badge={held.some((h) => h.asset.id === asset.id) ? messages.hedera.store.owned : null}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
        {/* ---- Prizes ---- */}
        <section className={PANEL}>
          <h2 className={PANEL_TITLE}>{t.prizes}</h2>
          {prizes.data?.length ? (
            <ul className="mt-6 flex flex-col">
              {prizes.data.map((p) => (
                <li key={p.id} className="border-menu-fg/12 border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
                  <Link
                    href={`/${locale}/hedera/prize?id=${encodeURIComponent(p.id)}`}
                    className="focus-visible:outline-signal group flex flex-wrap items-center gap-x-4 gap-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-menu-fg font-body text-body block leading-snug group-hover:underline">{p.tournament}</span>
                      <span className={`${QUIET} mt-1 block`}>
                        {messages.hedera.prize.place.replace("{n}", String(p.place))} ·{" "}
                        {/* The player's move: said in red, so it isn't read as more waiting. */}
                        <span className={p.status === "verify" || p.status === "resubmit" ? "text-signal font-semibold" : undefined}>
                          {messages.hedera.prize.status[p.status]}
                        </span>
                      </span>
                    </span>
                    <span className="font-display text-menu-fg text-[1.25rem] leading-none font-semibold tracking-[-0.02em]">
                      {formatHbar(p.hbar, messages)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-menu-fg/85 font-body text-body-sm mt-6">{t.prizesEmpty}</p>
          )}
        </section>

        {/* ---- Recent activity ---- */}
        <section className={PANEL}>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className={PANEL_TITLE}>{t.activity}</h2>
            <Link href={`/${locale}/hedera/activity`} className={TEXT_LINK}>
              {t.seeAll}
            </Link>
          </div>
          <div className="mt-6">
            {activity.data?.length ? (
              <ActivityList rows={activity.data.slice(0, 3)} messages={messages} locale={locale} />
            ) : (
              <p className="text-menu-fg/85 font-body text-body-sm">{t.activityEmpty}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
