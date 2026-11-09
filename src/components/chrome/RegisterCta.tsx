"use client";

import { usePathname } from "next/navigation";

import { BracketButton } from "@/components/ui/BracketButton";
import { authHref } from "@/lib/utils/auth-links";
import type { Messages } from "@/lib/utils/messages";

/**
 * JOIN BEYOND SERVICE, at the header's right for a visitor who is not signed
 * in. Per the human: "use the button component but without the bracket" - so
 * `BracketButton` with `brackets={false}`, at the utility links' 14px.
 *
 * It goes to Create Account (human, 2026-10-03), carrying the page it was
 * pressed on as `next`, so a new player lands back where they started. It used
 * to open the Google Sheet sheet (`RegisterDialog`), which nothing opens now.
 */
export function RegisterCta({ messages, locale }: { messages: Messages; locale: string }) {
  const pathname = usePathname();

  return (
    <BracketButton
      brackets={false}
      href={authHref(locale, "sign-up", pathname)}
      className="px-2.5 py-2 text-[0.8125rem] tracking-normal whitespace-nowrap md:px-4 md:py-2.5 md:text-[0.875rem]"
    >
      {/* JOIN BEYOND SERVICE is too wide beside the centred logo on a phone, and from lg to xl,
          where the nav links sit between them; it shortens to JOIN BS there (the team's fallback).
          The hidden one is display:none, so the link is named by the one on screen. */}
      <span className="md:hidden lg:inline xl:hidden">
        {messages.register.ctaShort}
      </span>
      <span className="hidden md:inline lg:hidden xl:inline">
        {messages.register.cta}
      </span>
    </BracketButton>
  );
}
