"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LogOutGlyph, LoginGlyph, PersonGlyph } from "@/components/profile/ProfileGlyphs";
import type { Messages } from "@/lib/utils/messages";
import type { Profile } from "@/types/profile";

export function AccountMenu({
  messages,
  locale,
  profile,
}: {
  messages: Messages;
  locale: string;
  profile: Profile | null;
}) {
  const t = messages.profile.account;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    };
    // Pointer rather than click: a mousedown outside should dismiss before the
    // click lands, so the menu never eats the first interaction elsewhere.
    const onPointerDown = (event: PointerEvent) => {
      if (root.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={messages.nav.account}
        aria-expanded={open}
        aria-haspopup="menu"
        className={
          profile
            ? "border-signal focus-visible:outline-signal relative grid size-8.5 cursor-pointer place-items-center overflow-hidden rounded-full border focus-visible:outline-2 focus-visible:outline-offset-2"
            : "bg-menu-fg/25 focus-visible:outline-signal hover:bg-menu-fg/35 grid size-8.5 cursor-pointer place-items-center rounded-full transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
        }
      >
        {profile ? (
          <Image
            src={profile.avatar}
            alt=""
            aria-hidden
            fill
            sizes="34px"
            className="scale-[1.35] object-cover object-top select-none"
          />
        ) : (
          <Image
            src="/assets/ornaments/user.svg"
            alt=""
            aria-hidden
            width={20}
            height={20}
            className="size-5 select-none"
          />
        )}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={t.menuLabel}
          className="bg-menu absolute top-[calc(100%+0.75rem)] right-0 z-50 w-[14.6875rem] rounded-md py-2.5 shadow-lg"
        >
          {profile ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="border-signal relative size-9 shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src={profile.avatar}
                    alt=""
                    aria-hidden
                    fill
                    sizes="36px"
                    className="scale-[1.35] object-cover object-top select-none"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-menu-fg font-body text-body-sm leading-none">{profile.name}</p>
                  <p className="text-menu-fg/60 font-body mt-1.5 text-[0.8125rem] leading-none">
                    {profile.handle}
                  </p>
                </div>
              </div>

              <hr className="border-menu-fg/12" />

              <Link
                href={`/${locale}/profile`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="text-menu-fg font-body text-body-sm focus-visible:outline-signal hover:bg-menu-fg/6 flex items-center gap-3 px-4 py-3.5 leading-none transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:-outline-offset-2"
              >
                <PersonGlyph />
                <span className="flex-1">{t.viewProfile}</span>
                <span aria-hidden className="text-menu-fg/60">
                  ›
                </span>
              </Link>

              <hr className="border-menu-fg/12" />

              <button
                type="button"
                role="menuitem"
                className="text-flare font-body text-body-sm focus-visible:outline-signal hover:bg-menu-fg/6 flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 leading-none transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:-outline-offset-2"
              >
                <LogOutGlyph />
                {messages.profile.logOut}
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="text-menu-fg font-body text-body-sm focus-visible:outline-signal hover:bg-menu-fg/6 flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 leading-none transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:-outline-offset-2"
            >
              <LoginGlyph />
              {t.login}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
