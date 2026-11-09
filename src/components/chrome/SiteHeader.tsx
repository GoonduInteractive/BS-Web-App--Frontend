"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";
import { AccountMenu } from "@/components/chrome/AccountMenu";
import { HeaderRule } from "@/components/chrome/NavRules";
import { RegisterCta } from "@/components/chrome/RegisterCta";
import type { Messages } from "@/lib/utils/messages";
import type { AuthUser } from "@/types/auth";

export function SiteHeader({
  messages,
  locale,
  onOpenMenu,
}: {
  messages: Messages;
  locale: string;
  onOpenMenu: () => void;
}) {
  const t = messages.nav;
  const { status, user } = useAuth();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 px-0 md:px-7">
      <div className="bg-nav pointer-events-auto flex h-16 items-center justify-between px-6 backdrop-blur-xs md:h-23 md:px-13.5">
        {/* ---- Left: menu trigger ---- */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t.openMenu}
          className="focus-visible:outline-signal group flex cursor-pointer items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="/assets/ornaments/menu-icon.svg"
            alt=""
            aria-hidden
            width={36}
            height={45}

            className="h-[45px] w-9 select-none"
          />
          <span className="text-menu-fg font-body text-body-sm font-medium">{t.menu}</span>
        </button>

        {/* ---- Centre: wordmark ---- */}
        <Link
          href={`/${locale}/the-game`}
          className="focus-visible:outline-signal absolute left-1/2 -translate-x-1/2 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="/assets/brand/beyond-service-logo.png"
            alt={t.wordmarkAlt}
            width={2097}
            height={750}
            priority
            sizes="194px"
            className="h-10 w-auto select-none md:h-17.25"
          />
        </Link>

        {/* ---- Right: utility links, then JOIN or the signed-in player's avatar ---- */}
        <div className="flex items-center gap-6 md:gap-11">

          <nav className="hidden items-center gap-6 lg:flex">
            <UtilityLink href={`/${locale}/comics`}>{t.comics}</UtilityLink>
            <UtilityLink href={`/${locale}/news`}>{t.news}</UtilityLink>
            <UtilityLink href={`/${locale}/merch`}>{t.merch}</UtilityLink>
          </nav>

          {/* Until the session is read, JOIN holds its place invisibly, so the
              row does not jump and a signed-in player never sees it flash. */}
          {user ? (
            <AccountMenu messages={messages} locale={locale} profile={toAccount(user)} />
          ) : (
            <div className={status === "loading" ? "invisible" : undefined}>
              <RegisterCta messages={messages} locale={locale} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function toAccount(user: AuthUser) {
  return { name: `${user.firstName} ${user.lastName}`.trim(), handle: user.handle, avatar: user.avatar };
}

/** Under the cursor: linen, and the hand-drawn rule beneath - see NavRules. */
function UtilityLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-menu-fg font-body text-body-sm focus-visible:outline-signal group relative transition-colors duration-300 ease-gate hover:text-linen focus-visible:text-linen focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {children}
      <HeaderRule className="-bottom-0.5" />
    </Link>
  );
}
