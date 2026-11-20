"use client";

import Link from "next/link";

import { toast } from "@/components/ui/Toaster";
import { useInviteLink } from "@/hooks/useInviteLink";
import type { Messages } from "@/lib/utils/messages";

/**
 * The player's invite link on their profile (the backend, 2026-11-19): Create
 * Account with their code and their own region (`lib/utils/invite.ts`), the
 * same link the Active Player Map hands out for their region. No frame draws
 * it: the Play Games panel's ash tile, the map's INVITE FRIENDS copy, and
 * EDIT PROFILE's outline button for COPY LINK. A player without a username is
 * asked to set one; the link still carries their region.
 */
export function ProfileInvite({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.community.invite;
  const { link, needsUsername } = useInviteLink(locale);

  const copy = () => {
    void navigator.clipboard
      ?.writeText(link)
      .then(() => toast(t.copied))
      .catch(() => {});
  };

  return (
    <section className="bg-ash mt-5.5 rounded-lg px-6.5 py-5.5">
      <h2 className="text-menu-fg font-body text-body leading-snug tracking-[0.01em]">{t.title}</h2>
      <p className="text-menu-fg/85 font-body text-body-sm mt-3.5 max-w-136 leading-snug">{t.body}</p>
      {needsUsername ? (
        <p className="text-menu-fg/85 font-body text-body-sm mt-2 max-w-136 leading-snug">
          {t.setUsername}{" "}
          <Link
            href={`/${locale}/profile/edit`}
            className="text-menu-fg focus-visible:outline-signal underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t.setUsernameCta}
          </Link>
        </p>
      ) : null}

      <div className="mt-4.5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="profile-invite-link">
          {t.linkLabel}
        </label>
        <input
          id="profile-invite-link"
          type="text"
          readOnly
          value={link}
          onFocus={(event) => event.currentTarget.select()}
          className="border-menu-fg/25 text-menu-fg/85 font-body focus-visible:outline-signal h-11 min-w-0 flex-1 rounded-md border bg-transparent px-3.5 text-[0.875rem] focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <button
          type="button"
          onClick={copy}
          className="border-menu-fg/90 text-menu-fg font-body focus-visible:outline-signal inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-md border px-4 text-[0.9375rem] leading-none transition-colors duration-150 ease-gate hover:bg-menu-fg/10 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {t.copy}
        </button>
      </div>
    </section>
  );
}
