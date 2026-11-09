import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";

/**
 * The card every auth frame is drawn on (`context/design/auth-flow/`): the
 * roster's red-to-black ground, a 628-wide pitch card with a smoke hairline
 * and 20px corners, the wordmark, then the title in Teko.
 *
 * `offset` is the card's distance from the top at 1440, which the frames do
 * not keep constant: Create Account and Confirm Email sit at 113, the shorter
 * three at 153. Phones get no frame; the card goes full width inside the 16px
 * gutter and its 70px side padding drops to 20.
 */
export function AuthCard({
  messages,
  locale,
  title,
  back,
  offset = "low",
  titleGap = "sm:mt-11",
  children,
}: {
  messages: Messages;
  locale: string;
  title: string;
  /** Forgot Password's arrow, left of the title. */
  back?: { href: string; label: string };
  offset?: "high" | "low";
  /** Logo to title, from `sm` up. Sign In draws 61px, Create Account 47, Confirm Email 36. */
  titleGap?: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-roster flex min-h-dvh justify-center px-4 py-10 md:pb-24">
      <div
        className={cn(
          "border-smoke bg-pitch h-fit w-full max-w-[39.25rem] rounded-[1.25rem] border px-5 pt-8 pb-10 sm:px-[4.375rem]",
          offset === "high" ? "md:mt-[4.5rem]" : "md:mt-[7rem]",
        )}
      >
        <Link
          href={`/${locale}/the-game`}
          aria-label={messages.auth.home}
          className="focus-visible:outline-signal mx-auto block w-fit focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="/assets/brand/beyond-service-logo.png"
            alt={messages.nav.wordmarkAlt}
            width={2097}
            height={750}
            priority
            sizes="192px"
            className="h-auto w-40 select-none sm:w-48"
          />
        </Link>

        <div className={cn("relative mt-7 flex items-center justify-center", titleGap)}>
          {back ? (
            <Link
              href={back.href}
              aria-label={back.label}
              className="text-white focus-visible:outline-signal absolute left-0 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <ArrowLeft aria-hidden className="size-6" strokeWidth={1.5} />
            </Link>
          ) : null}
          <h1 className={`font-display text-white text-center ${back ? "px-8" : ""} text-[1.875rem] leading-none font-semibold uppercase sm:text-h3 sm:leading-none`}>
            {title}
          </h1>
        </div>

        {children}
      </div>
    </main>
  );
}

/** "Don't have an account? Create Account", centred at the foot of the card. */
export function AuthSwitch({
  prompt,
  link,
  href,
  tight = false,
}: {
  prompt: string;
  link: string;
  href: string;
  /** Create Account sets it 33px under the Google button; the others 52. */
  tight?: boolean;
}) {
  return (
    <p className={`text-white/70 font-body mt-8 text-center text-[0.9375rem] ${tight ? "sm:mt-5" : "sm:mt-10"}`}>
      {prompt}{" "}
      <Link
        href={href}
        className="text-white focus-visible:outline-signal ml-1 font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {link}
      </Link>
    </p>
  );
}

/** An error or a notice under a form. */
export function AuthNotice({ id, tone, children }: { id?: string; tone: "error" | "info"; children: ReactNode }) {
  return (
    <p
      id={id}
      role={tone === "error" ? "alert" : "status"}
      // Not `cn()`: twMerge reads `text-body-sm` as a colour and would drop one of the two.
      className={`font-body text-body-sm mt-5 ${tone === "error" ? "text-flare" : "text-white/80"}`}
    >
      {children}
    </p>
  );
}
