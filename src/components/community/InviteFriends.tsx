"use client";

import Link from "next/link";

import { BracketButton } from "@/components/ui/BracketButton";
import { toast } from "@/components/ui/Toaster";
import { useInviteLink } from "@/hooks/useInviteLink";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";

/**
 * INVITE FRIENDS, under the map's readout. The phone frame draws it
 * (`mobile-active-map/home/game.png`, 360); the 1440 frame ends at the disc,
 * and it shows there too, under the count, per the human (2026-11-17).
 *
 * `body` replaces the frame's line: the nudge for a player whose region is
 * short of players (`MapPanel`).
 *
 * THE LINK IS AN INVITE (`lib/utils/invite.ts`, the backend, 2026-11-19):
 * Create Account with the player's code - their username - and `region`, the
 * one picked on the map or else their own, which sign-up shows fixed. The
 * heading names that region. A visitor who isn't signed in shares the region
 * alone; a player with no username is asked to set one, the link still
 * carrying the region. The frame's `…/invite/3245gt7` shape isn't used: the
 * code travels in the sign-up link's query.
 *
 * Measured at 360: heading 14px at cap 1753; two 12px lines at a 16 pitch from
 * cap 1785, grey; the link field 19..330 x 1825..1873 - a 2px ring, rounded,
 * the URL 14px grey from x 36; COPY LINK a 70 x 32 red button at 36 with 21px
 * brackets at 19 and 121. The label is Teko - 48px wide for nine characters
 * is the condensed face, not Host Grotesk - the scale's Button style, which
 * every other BracketButton on the site overrides with the body face per Figma.
 *
 * The field is a read-only input rather than a paragraph so the link can be
 * selected and copied by hand where the clipboard is refused. Only a write
 * that actually succeeded says so, in a toast, as every confirmation on the
 * site does; the frame draws no confirmed state.
 */
export function InviteFriends({
  region,
  body,
  messages,
  locale,
  className,
}: {
  /** The region invited to: its slug goes in the link, its name in the heading. */
  region: { slug: string; name: string } | null;
  /** In place of the frame's line, e.g. the nudge for a region short of players. */
  body?: string;
  messages: Messages;
  locale: string;
  className?: string;
}) {
  const t = messages.community.invite;
  const { link, needsUsername } = useInviteLink(locale, region?.slug);

  return (
    <div className={cn("max-w-[19.5rem]", className)}>
      <h2 className="text-menu-fg font-body text-body-sm leading-none">
        {region ? t.titleRegion.replace("{region}", region.name.toUpperCase()) : t.title}
      </h2>
      <p className="text-menu-fg/52 font-body mt-4.5 max-w-[14.5rem] text-[0.75rem] leading-4">{body ?? t.body}</p>
      {needsUsername ? (
        <p className="text-menu-fg/80 font-body mt-3 max-w-[16rem] text-[0.75rem] leading-4">
          {t.setUsername}{" "}
          <Link
            href={`/${locale}/profile/edit`}
            className="text-menu-fg focus-visible:outline-signal underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t.setUsernameCta}
          </Link>
        </p>
      ) : null}

      <label className="sr-only" htmlFor="community-invite-link">
        {t.linkLabel}
      </label>
      <input
        id="community-invite-link"
        type="text"
        readOnly
        value={link}
        onFocus={(event) => event.currentTarget.select()}
        className="border-ash text-disabled-fg font-body focus-visible:outline-signal mt-2.5 h-12.25 w-full rounded border-2 bg-transparent pl-3.75 text-[0.875rem] leading-none focus-visible:outline-2 focus-visible:outline-offset-2"
      />

      <div className="mt-4.75">
        <BracketButton
          size="xs"
          onClick={() => {
            void navigator.clipboard
              ?.writeText(link)
              .then(() => toast(t.copied))
              .catch(() => {});
          }}
          className="font-display px-2.75 py-2.25 text-[0.875rem] leading-none tracking-normal whitespace-nowrap"
        >
          {t.copy}
        </BracketButton>
      </div>
    </div>
  );
}
