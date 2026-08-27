"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { GATES, gateHref } from "@/lib/gates";
import type { Messages } from "@/lib/utils/messages";
import { cn } from "@/lib/utils/cn";

/**
 * The menu overlay — motion moment 6.
 *
 * Geometry from context/design/07-menu-nav/Menu (1).png, a 651 x 941 frame. The
 * frame is the panel's TRUE width, not a crop: 651/1440 is 45.2% of the
 * viewport, and its ground reads #1A1A1A, matching --color-menu exactly.
 *
 *   close X   x 579, y 42, 20 x 21
 *   links     x 118, first at y 173, cap 50 -> ~70px, 104px pitch
 *   utility   x 118, y 772, cap 11
 *
 * The 104px pitch is exact across all five links, not averaged.
 *
 * THE STAGGER IS CSS, NOT GSAP. A staggered reveal is a set of delays, not a
 * timeline — there is nothing to seek, reverse or coordinate. Per-index
 * `transition-delay` does it with no JavaScript and keeps GSAP out of the
 * initial bundle, which matters on metered data. The global reduced-motion block
 * in globals.css collapses these transitions for free.
 *
 * EVERY LINK IS A PLAIN next/link. TransitionProvider intercepts internal anchor
 * clicks globally, so the tear plays without a click handler here. This is also
 * the only route to a gate on mobile, where the rail does not exist.
 */

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

  // Close on navigation, so the overlay is gone before the tear opens on the
  // new route rather than sitting over it.
  useEffect(() => {
    if (open) onClose();
    // Deliberately keyed on pathname alone: this should fire when the route
    // changes, not when `open` or `onClose` identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape to close, focus trap, and scroll lock.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = overflow;
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
      {/* Scrim over the remaining 55%, so a click outside the panel closes it. */}
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

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={messages.menu.label}
        className={cn(
          "bg-menu absolute inset-y-0 left-0 flex w-full flex-col transition-transform duration-400 ease-gate md:w-[45.2%]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.closeMenu}
          className="focus-visible:outline-signal absolute top-[31px] right-[43px] cursor-pointer p-2 transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
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

        <nav className="flex flex-col pt-24 pl-8 md:pt-32 md:pl-14 lg:pl-20 xl:pt-41.5 xl:pl-29.5">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ transitionDelay: open ? `${120 + i * STAGGER_MS}ms` : "0ms" }}
              className={cn(
                "text-menu-fg font-display text-menu-link focus-visible:outline-signal group w-fit leading-none font-semibold transition-[opacity,transform] duration-400 ease-gate focus-visible:outline-6 focus-visible:outline-offset-4",
                // Pitch is 104px at 1440 — the type is 77.8px on a 1 line-height,
                // so the remainder is padding rather than a margin, which keeps
                // the hover underline tight to the text. Below 1440 the type is
                // fluid (see --text-menu-link) and the padding steps with it.
                //
                // THE PANEL IS A FIXED 45.2% OF THE VIEWPORT, so a fixed link
                // size overflows it on everything narrower than the frame. At
                // 1024 the panel is 463px and "THE CHARACTERS" was 415px before
                // padding: the links wrapped to two lines and shoved the utility
                // links off the bottom of the screen. The left padding steps down
                // too, because 118px of it is a third of a tablet-width panel.
                // There is no tablet or mobile menu frame, so the stops are a
                // judgement call rather than a match.
                "pb-4 tracking-[-0.05em] md:pb-5 xl:pb-[26px]",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              {/*
                Hover underline (motion moment 6). It has to be a background
                IMAGE, not a background colour: `background-size` has no effect
                on a colour, so `bg-menu-fg` here painted a solid white block
                behind every link instead of a growing 1px rule. A two-stop
                gradient of currentColor is the standard way to get a scalable
                rule, and it inherits the link colour for free.
              */}
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-size-[0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-300 ease-gate group-hover:bg-size-[100%_2px] group-focus-visible:bg-size-[100%_2px]">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div
          style={{ transitionDelay: open ? `${120 + links.length * STAGGER_MS}ms` : "0ms" }}
          className={cn(
            "mt-auto flex gap-9 pb-16 pl-8 transition-[opacity,transform] duration-400 ease-gate md:pl-14 md:pb-24 lg:pl-20 xl:pb-38 xl:pl-29.5",
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <UtilityLink href={`/${locale}/comics`}>{t.comics}</UtilityLink>
          <UtilityLink href={`/${locale}/news`}>{t.news}</UtilityLink>
          <UtilityLink href={`/${locale}/merch`}>{t.merch}</UtilityLink>
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
