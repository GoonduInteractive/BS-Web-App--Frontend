"use client";

import { Wallet } from "lucide-react";
import Link from "next/link";

import { CalabashCard, CalabashFigure } from "@/components/calabash/Calabash";
import { HashscanLink, PublicNote } from "@/components/hedera/bits";
import { FIGURE, OUTLINE_BUTTON, TEXT_LINK } from "@/components/hedera/styles";
import { HbarIcon } from "@/components/ui/CurrencyIcons";
import { useHoldings, useWalletLink } from "@/hooks/useHedera";
import { formatDay, formatHbar } from "@/lib/hedera/format";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The Calabash's HBAR tab (`components/calabash/Calabash.tsx`): the balance in
 * the linked wallet and what HBAR is, then the wallet itself - what the hub's
 * LINKED WALLET panel was, so the hub and the profile show the same thing.
 * Two grid children, the tab's two halves. Hedera code: the profile loads it
 * lazily (`lazy.tsx`), only while the section runs.
 */
export function CalabashHbar({ messages, locale }: { messages: Messages; locale: Locale }) {
  const t = messages.hedera.hub;
  const link = useWalletLink();
  const holdings = useHoldings();
  const wallet = link.data;

  return (
    <>
      <CalabashFigure
        label={t.hbar}
        glyph={<HbarIcon className="size-9 shrink-0" />}
        value={wallet ? (holdings.data ? formatHbar(holdings.data.hbar, messages) : "—") : null}
        empty={t.hbarNone}
        about={t.hbarAbout}
      >
        {wallet ? <p className="text-menu-fg/60 font-body mt-3 text-[0.8125rem]">{t.hbarNote}</p> : null}
      </CalabashFigure>

      <CalabashCard title={t.wallet}>
        {link.isPending ? (
          <div aria-busy className="mt-6 h-32" />
        ) : wallet ? (
          <div className="mt-6">
            <p className={`${FIGURE} text-[2rem] tracking-[-0.02em] break-all`}>{wallet.accountId}</p>
            <p className="text-menu-fg/85 font-body text-body-sm mt-3">
              {t.linkedWith.replace("{provider}", wallet.provider).replace("{date}", formatDay(wallet.linkedAt))}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              <HashscanLink kind="account" value={wallet.accountId} label={messages.hedera.viewOnHashscan} />
              <Link href={`/${locale}/profile/edit`} className={TEXT_LINK}>
                {t.manage}
              </Link>
              <Link href={`/${locale}/hedera/store`} className={TEXT_LINK}>
                {t.store}
              </Link>
            </div>
            <PublicNote messages={messages} className="mt-6" />
          </div>
        ) : (
          <div className="mt-6">
            <p className="font-display text-menu-fg text-[1.75rem] leading-none font-semibold tracking-[-0.03em] uppercase">{t.noWallet.title}</p>
            <p className="text-menu-fg/85 font-body text-body mt-3 max-w-[30rem]">{t.noWallet.body}</p>
            <Link href={`/${locale}/hedera/connect`} className={`${OUTLINE_BUTTON} mt-6`}>
              <Wallet aria-hidden className="size-4" strokeWidth={1.75} />
              {t.noWallet.cta}
            </Link>
          </div>
        )}
      </CalabashCard>
    </>
  );
}
