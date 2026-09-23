"use client";

import { useState } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";

/**
 * INVITE FRIENDS, under the map's readout. Only the phone frame draws it
 * (`mobile-active-map/home/game.png`, 360): the 1440 frame ends at the disc.
 * Rendered below `lg` as drawn and FLAGGED - if Design wants it on the desktop
 * too, the caller drops the `lg:hidden`.
 *
 * Measured at 360: heading 14px at cap 1753; two 12px lines at a 16 pitch from
 * cap 1785, grey; the link field 19..330 x 1825..1873 - a 2px ring, rounded,
 * the URL 14px grey from x 36; COPY LINK a 70 x 32 red button at 36 with 21px
 * brackets at 19 and 121. The label is Teko - 48px wide for nine characters
 * is the condensed face, not Host Grotesk - the scale's Button style, which
 * every other BracketButton on the site overrides with the body face per Figma.
 *
 * The field is a read-only input rather than a paragraph so the link can be
 * selected and copied by hand where the clipboard is refused. The button's
 * label only changes when the write actually succeeded - the transfer screen's
 * rule. "Copied" is ours, as it was there: the frame draws no confirmed state.
 */
export function InviteFriends({ link, messages, className }: { link: string; messages: Messages; className?: string }) {
  const t = messages.community.invite;
  const [done, setDone] = useState(false);

  return (
    <div className={cn("max-w-[19.5rem]", className)}>
      <h2 className="text-menu-fg font-body text-body-sm leading-none">{t.title}</h2>
      <p className="text-menu-fg/52 font-body mt-4.5 max-w-[14.5rem] text-[0.75rem] leading-4">{t.body}</p>

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
              .then(() => {
                setDone(true);
                window.setTimeout(() => setDone(false), 2000);
              })
              .catch(() => {});
          }}
          className="font-display px-2.75 py-2.25 text-[0.875rem] leading-none tracking-normal whitespace-nowrap"
        >
          <span aria-live="polite">{done ? t.copied : t.copy}</span>
        </BracketButton>
      </div>
    </div>
  );
}
