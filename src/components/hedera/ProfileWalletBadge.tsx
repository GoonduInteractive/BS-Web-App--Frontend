"use client";

import { Wallet } from "lucide-react";
import Link from "next/link";

import { TEXT_LINK } from "@/components/hedera/styles";
import { useWalletLink } from "@/hooks/useHedera";
import type { Messages } from "@/lib/utils/messages";

/**
 * The profile's Hedera line (the doc's changed screens: "wallet linked badge;
 * link to the Hedera hub"). No frame draws it: the gild plate the profile's
 * own glyphs sit on, and the section's text link.
 */
export function ProfileWalletBadge({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.hedera.profile;
  const link = useWalletLink();

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      {link.data ? (
        <span className="bg-gild text-ink font-body inline-flex items-center gap-1.5 rounded-sm px-2 pt-1.5 pb-1 text-[0.8125rem] leading-none">
          <Wallet aria-hidden className="size-3.5" strokeWidth={2} />
          {t.linked}
        </span>
      ) : null}
      <Link href={`/${locale}/hedera/hub`} className={TEXT_LINK}>
        {t.hub}
      </Link>
    </div>
  );
}
