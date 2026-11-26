"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";
import { CTA, OUTLINE_BUTTON } from "@/components/hedera/styles";
import { BracketButton } from "@/components/ui/BracketButton";
import { useWalletLink } from "@/hooks/useHedera";
import { authHref } from "@/lib/utils/auth-links";
import { clsx as cn } from "clsx";
import type { Messages } from "@/lib/utils/messages";

/**
 * The explainer's two states (the doc: signed out, signed in): sign in to
 * start; link a wallet; or, linked, the hub. The store is open to everyone.
 */
export function ExplainerActions({ messages, locale, className }: { messages: Messages; locale: string; className?: string }) {
  const t = messages.hedera.explainer;
  const { status } = useAuth();
  const link = useWalletLink();

  const primary =
    status === "signed-out"
      ? { href: authHref(locale, "sign-in", `/${locale}/hedera/connect`), label: t.signIn }
      : link.data
        ? { href: `/${locale}/hedera/hub`, label: t.hub }
        : { href: `/${locale}/hedera/connect`, label: t.connect };
  const settled = status === "signed-out" || (status === "signed-in" && !link.isPending);

  return (
    <div className={cn("flex min-h-15 flex-wrap items-center gap-x-8 gap-y-5", className)}>
      {settled ? (
        <BracketButton href={primary.href} className={CTA}>
          {primary.label}
        </BracketButton>
      ) : null}
      <Link href={`/${locale}/hedera/store`} className={OUTLINE_BUTTON}>
        {t.store}
      </Link>
    </div>
  );
}
