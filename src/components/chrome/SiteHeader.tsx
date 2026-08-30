"use client";

import Image from "next/image";
import Link from "next/link";

import type { Messages } from "@/lib/utils/messages";

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
            // Natural aspect. menu-icon.svg is 36 WIDE x 45 TALL, so a wider-
            // than-tall box makes it letterbox and shrink rather than fill.
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

        {/* ---- Right: utility links and account ---- */}
        <div className="flex items-center gap-6 md:gap-11">
          {/* lg, not md. The wordmark is absolutely centred, so between 768 and
              1023 these links ran straight over it — "Comics" sat on top of the
              SERVICE lettering. Below lg they live in the menu overlay instead,
              which is already the only route to a gate at those widths. */}
          <nav className="hidden items-center gap-6 lg:flex">
            <UtilityLink href={`/${locale}/comics`}>{t.comics}</UtilityLink>
            <UtilityLink href={`/${locale}/news`}>{t.news}</UtilityLink>
            <UtilityLink href={`/${locale}/merch`}>{t.merch}</UtilityLink>
          </nav>

          {/*
            FLAGGED: the circle's fill has no token. It measures about #43464A in
            the frame, which is close to --color-menu-fg at low opacity over the
            dark bar, so it is expressed that way rather than by inventing a hex.
            Ask Design for the real value.
          */}
          <button
            type="button"
            aria-label={t.account}
            className="bg-menu-fg/25 focus-visible:outline-signal grid size-8.5 cursor-pointer place-items-center rounded-full transition-colors duration-150 ease-gate hover:bg-menu-fg/35 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Image
              src="/assets/ornaments/user.svg"
              alt=""
              aria-hidden
              width={20}
              height={20}
              className="size-5 select-none"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

function UtilityLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-menu-fg font-body text-body-sm focus-visible:outline-signal relative transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {children}
    </Link>
  );
}
