"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { MenuOverlay } from "@/components/chrome/MenuOverlay";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SoundToggle } from "@/components/chrome/SoundToggle";
import { useGateEntry } from "@/components/gates/GateEntry";
import { GateRail } from "@/components/gates/GateRail";
import { GATES, type GateId } from "@/lib/gates";
import { isHidden } from "@/lib/hidden-sections";
import type { Messages } from "@/lib/utils/messages";
import type { Profile } from "@/types/profile";

/**
 * Global chrome - header, menu overlay, sound toggle and gate rail.
 */
export function SiteChrome({
  messages,
  profile = null,
}: {
  messages: Messages;
  /** The signed-in player, or null. Mock state, not a session. */
  profile?: Profile | null;
}) {
  const pathname = usePathname();
  const { shown } = useGateEntry();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] ?? "en";
  // One segment means `/en`, the portal - the entry screen until a door is
  // shown, and the entry screen alone goes without the chrome.
  const isEntry = segments.length <= 1 && !shown;

  // THE COMIC READER REPLACES THE SITE CHROME WITH ITS OWN BAR. The frame draws
  // no menu, no wordmark and no account there - just BACK, the issue's title and
  // the share row, fixed to the top so it stays with the reader down the page.
  // Rendering both would put two bars over each other. While comics is not
  // public (`lib/hidden-sections.ts`) that address is the Coming Soon page,
  // which has no bar of its own and keeps the chrome.
  const isReader = segments.length === 3 && segments[1] === "comics" && !isHidden("comics");

  if (isEntry || isReader) return null;

  const railLabels = Object.fromEntries(
    GATES.map((gate) => [gate.id, messages.gates[gate.id].rail]),
  ) as Record<GateId, string>;

  return (
    <>
      <SiteHeader messages={messages} locale={locale} onOpenMenu={openMenu} profile={profile} />
      <MenuOverlay messages={messages} locale={locale} open={menuOpen} onClose={closeMenu} />
      <GateRail railLabel={messages.gates.railLabel} labels={railLabels} />

      {/* Bottom-left, matching the gate frames. */}
      <div className="fixed bottom-4 left-4 z-30 md:bottom-10 md:left-24">
        <SoundToggle onLabel={messages.entry.soundOn} offLabel={messages.entry.soundOff} />
      </div>
    </>
  );
}
