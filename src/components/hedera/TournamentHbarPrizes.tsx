"use client";

import { Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { OUTLINE_BUTTON, QUIET } from "@/components/hedera/styles";
import { useWalletLink } from "@/hooks/useHedera";
import { formatHbar } from "@/lib/hedera/format";
import { connectHref } from "@/lib/hedera/links";
import type { Messages } from "@/lib/utils/messages";

/**
 * Under a tournament's facts, when it pays in HBAR (the doc's changed
 * screens): the HBAR per place, and - for anyone without a linked wallet -
 * "link a wallet to receive HBAR prizes". No frame draws it: the facts'
 * own type, centred under them, and the section's outline button.
 */
export function TournamentHbarPrizes({ hbar, messages, locale }: { hbar: readonly number[]; messages: Messages; locale: string }) {
  const t = messages.hedera.tournament;
  const pathname = usePathname();
  const { status } = useAuth();
  const link = useWalletLink();
  const prompt = status === "signed-out" || (status === "signed-in" && link.isSuccess && !link.data);

  return (
    <div className="mx-auto flex w-full max-w-[56rem] flex-col gap-5 px-5 pt-10 lg:items-center lg:px-20 lg:text-center">
      <p className="text-menu-fg/92 font-body text-body-sm">
        {t.hbarPrizes}:{" "}
        {hbar.map((amount, i) => `${messages.hedera.prize.place.replace("{n}", String(i + 1))}: ${formatHbar(amount, messages)}`).join(" · ")}
      </p>
      {prompt ? (
        <div className="flex flex-col gap-3 lg:items-center">
          <p className={QUIET}>{t.linkPrompt}</p>
          <Link href={connectHref(locale, pathname)} className={`${OUTLINE_BUTTON} self-start lg:self-center`}>
            <Wallet aria-hidden className="size-4" strokeWidth={1.75} />
            {t.linkCta}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
