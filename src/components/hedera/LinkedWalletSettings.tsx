"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { PublicNote, Stopped } from "@/components/hedera/bits";
import { FIGURE, OUTLINE_BUTTON, PANEL_TITLE, QUIET } from "@/components/hedera/styles";
import { BracketButton } from "@/components/ui/BracketButton";
import { toast } from "@/components/ui/Toaster";
import { TornDialog } from "@/components/ui/TornDialog";
import { useRefreshHedera, useWalletLink } from "@/hooks/useHedera";
import { unlinkWallet } from "@/lib/api/hedera";
import { formatDay } from "@/lib/hedera/format";
import { connectHref } from "@/lib/hedera/links";
import type { Messages } from "@/lib/utils/messages";

/**
 * Account settings' linked wallet (the doc's changed screens: view, change,
 * unlink - with a warning that exclusives stay in the old wallet). Under the
 * Edit Profile form; no frame draws it.
 */
export function LinkedWalletSettings({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.hedera.settings;
  const link = useWalletLink();
  const refresh = useRefreshHedera();
  const [confirming, setConfirming] = useState(false);
  const unlink = useMutation({
    mutationFn: unlinkWallet,
    onSuccess: async () => {
      setConfirming(false);
      await refresh();
      toast(t.unlinked);
    },
  });
  const wallet = link.data;
  const here = `/${locale}/profile/edit`;

  return (
    <section className="border-menu-fg/9 mt-14 border-t pt-10">
      <h2 className={PANEL_TITLE}>{t.title}</h2>

      {link.isPending ? (
        <div aria-busy className="mt-5 h-16" />
      ) : wallet ? (
        <>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <p className={`${FIGURE} text-[1.75rem] tracking-[-0.02em] break-all`}>{wallet.accountId}</p>
              <p className={`${QUIET} mt-2`}>
                {messages.hedera.hub.linkedWith.replace("{provider}", wallet.provider).replace("{date}", formatDay(wallet.linkedAt))}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={connectHref(locale, here)} className={OUTLINE_BUTTON}>
                {t.change}
              </Link>
              <button type="button" onClick={() => setConfirming(true)} aria-label={t.unlinkLabel} className={OUTLINE_BUTTON}>
                {t.unlink}
              </button>
            </div>
          </div>
          <PublicNote messages={messages} className="mt-5 max-w-[36rem]" />
        </>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-menu-fg/85 font-body text-body">{t.none}</p>
          <Link href={connectHref(locale, here)} className={OUTLINE_BUTTON}>
            {t.link}
          </Link>
        </div>
      )}

      <TornDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        label={t.unlinkTitle}
        closeLabel={messages.hedera.claim.close}
        maxWidthClassName="max-w-[40rem]"
        className="px-6 pt-16 pb-14 text-center sm:px-20 sm:pt-[4.5rem] sm:pb-20"
      >
        <h2 className="font-display text-ink text-section-heading font-semibold tracking-[-0.058em] uppercase">{t.unlinkTitle}</h2>
        <p className="text-ash font-body text-body mt-3">{t.unlinkBody.replace("{account}", wallet?.accountId ?? "")}</p>
        {unlink.isError ? <Stopped className="mt-4">{messages.hedera.error}</Stopped> : null}
        <div className="mt-8 flex flex-col items-center gap-5">
          <BracketButton
            tone="ink"
            field="light"
            onClick={() => unlink.mutate()}
            disabled={unlink.isPending}
            aria-busy={unlink.isPending || undefined}
            className="px-4.75 py-4.75 leading-none tracking-normal"
          >
            {t.unlinkConfirm}
          </BracketButton>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-ink font-body text-body-sm focus-visible:outline-signal cursor-pointer underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {t.keep}
          </button>
        </div>
      </TornDialog>
    </section>
  );
}
