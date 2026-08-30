"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { MenuOverlay } from "@/components/chrome/MenuOverlay";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SoundToggle } from "@/components/chrome/SoundToggle";
import { GateRail } from "@/components/gates/GateRail";
import { GATES, type GateId } from "@/lib/gates";
import type { Messages } from "@/lib/utils/messages";

/**
 * Global chrome — header, menu overlay, sound toggle and gate rail.
 */
export function SiteChrome({ messages }: { messages: Messages }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] ?? "en";
  // One segment means `/en` — the entry screen.
  const isEntry = segments.length <= 1;

  if (isEntry) return null;

  const railLabels = Object.fromEntries(
    GATES.map((gate) => [gate.id, messages.gates[gate.id].rail]),
  ) as Record<GateId, string>;

  return (
    <>
      <SiteHeader messages={messages} locale={locale} onOpenMenu={openMenu} />
      <MenuOverlay messages={messages} locale={locale} open={menuOpen} onClose={closeMenu} />
      <GateRail railLabel={messages.gates.railLabel} labels={railLabels} />

      {/* Bottom-left, matching the gate frames. */}
      <div className="fixed bottom-4 left-4 z-30 md:bottom-10 md:left-24">
        <SoundToggle onLabel={messages.entry.soundOn} offLabel={messages.entry.soundOff} />
      </div>
    </>
  );
}
