"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { MenuRule } from "@/components/chrome/NavRules";
import { useScrollLock } from "@/hooks/useScrollLock";
import { GATES, gateHref } from "@/lib/gates";
import { HEDERA_ON } from "@/lib/hedera/mode";
import type { Messages } from "@/lib/utils/messages";
import { cn } from "@/lib/utils/cn";

/** Milliseconds between each link's reveal. */
const STAGGER_MS = 60;

export function MenuOverlay({
  messages,
  locale,
  open,
  onClose,
}: {
  messages: Messages;
  locale: string;
  open: boolean;
  onClose: () => void;
}) {
  const t = messages.nav;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (open) onClose();

  }, [pathname]);

  // The page behind holds still; the panel itself scrolls (data-lenis-prevent)
  // when a screen is too short even for the height-scaled links.
  useScrollLock(open);

  // Escape to close, and the focus trap.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      // Wrap in both directions, so focus can never escape the panel.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  const links = [
    ...GATES.map((gate) => ({
      href: gateHref(locale, gate),
      label: messages.gates[gate.id].menu,
    })),
    { href: `/${locale}/about`, label: messages.menu.about },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-45",
        open ? "" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >

      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className={cn(
          "bg-ink/60 absolute inset-0 transition-opacity duration-300 ease-gate",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* --menu-room is the height the panel can share out (see --text-menu-link
          in globals.css): the top and bottom paddings and the gap under each link
          take the frame's share of it, capped at the frame's own values. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={messages.menu.label}
        data-lenis-prevent
        className={cn(
          "bg-menu absolute inset-y-0 left-0 flex w-full flex-col overflow-y-auto overscroll-contain transition-transform duration-400 ease-gate md:w-[45.2%]",
          "[--menu-room:calc(100svh_-_7.1875rem)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.closeMenu}
          className="focus-visible:outline-signal absolute top-7.75 right-10.75 cursor-pointer p-2 transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Image
            src="/assets/ornaments/close-menu-icon.svg"
            alt=""
            aria-hidden
            width={26}
            height={28}
            className="h-7 w-6.5 select-none"
          />
        </button>

        <nav className="flex flex-col pt-[min(6rem,calc(var(--menu-room)*0.2083))] pl-8 md:pt-[min(8rem,calc(var(--menu-room)*0.2083))] md:pl-14 lg:pl-20 xl:pt-[min(10.375rem,calc(var(--menu-room)*0.2083))] xl:pl-29.5">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ transitionDelay: open ? `${120 + i * STAGGER_MS}ms` : "0ms" }}
              className={cn(
                "text-menu-fg font-display text-menu-link focus-visible:outline-signal group w-fit leading-none font-semibold transition-[opacity,transform] duration-400 ease-gate focus-visible:outline-6 focus-visible:outline-offset-4",
                // The span under this carries 12 of the gap (its rule lives there); these
                // make up the rest, so the pitch is the frame's.
                "pb-[min(0.5rem,calc(var(--menu-room)*0.0226))] tracking-tighter md:pb-[min(0.75rem,calc(var(--menu-room)*0.0226))] xl:pb-[min(1.125rem,calc(var(--menu-room)*0.0226))]",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >

              {/* Under the cursor the label turns linen and the delivered rule
                  (menu-border.svg) draws in beneath it, left to right - where a
                  2px line used to grow. See NavRules. */}
              <span className="relative inline-block pb-3 transition-colors duration-300 ease-gate group-hover:text-linen group-focus-visible:text-linen">
                {link.label}
                <MenuRule className="bottom-0" />
              </span>
            </Link>
          ))}
        </nav>

        <div
          style={{ transitionDelay: open ? `${120 + links.length * STAGGER_MS}ms` : "0ms" }}
          className={cn(
            "mt-auto flex gap-9 pt-8 pb-[min(4rem,calc(var(--menu-room)*0.1907))] pl-8 transition-[opacity,transform] duration-400 ease-gate md:pl-14 md:pb-[min(6rem,calc(var(--menu-room)*0.1907))] lg:pl-20 xl:pb-[min(9.5rem,calc(var(--menu-room)*0.1907))] xl:pl-29.5",
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <UtilityLink href={`/${locale}/comics`}>{t.comics}</UtilityLink>
          <UtilityLink href={`/${locale}/news`}>{t.news}</UtilityLink>
          <UtilityLink href={`/${locale}/merch`}>{t.merch}</UtilityLink>
          {/* Only while the Hedera section is on (`lib/hedera/mode.ts`). */}
          {HEDERA_ON ? <UtilityLink href={`/${locale}/hedera`}>{t.hedera}</UtilityLink> : null}
        </div>
      </div>
    </div>
  );
}

function UtilityLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-menu-fg font-body text-body-sm focus-visible:outline-signal transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {children}
    </Link>
  );
}
