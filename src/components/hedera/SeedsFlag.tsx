"use client";

import { Info } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";

/**
 * "Not real money", beside Seeds wherever they sit near HBAR (Sophia,
 * 2026-11-23: the two currencies share a look, so Seeds need a clear flag).
 * The words are always visible; the fuller line shows on hover or focus, and
 * on a tap for touch screens. `tone` follows the ground: light text on the
 * dark panels, ink on the gold.
 *
 * No frame draws it: the site's small body type and a Lucide `Info`.
 */
export function SeedsFlag({ messages, tone = "light", className }: { messages: Messages; tone?: "light" | "ink"; className?: string }) {
  const t = messages.hedera.seedsFlag;
  const [open, setOpen] = useState(false);
  const tipId = useId();

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-describedby={tipId}
        aria-expanded={open}
        // A mouse shows it on hover; a tap toggles it (a tap also fires the hover events,
        // which would open it and the click shut it again); the keyboard shows it on focus, in CSS.
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        className={cn(
          "peer font-body focus-visible:outline-signal inline-flex cursor-help items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem] leading-none tracking-[0.02em] focus-visible:outline-2 focus-visible:outline-offset-2",
          tone === "light" ? "border-menu-fg/35 text-menu-fg/85" : "border-ink/40 text-ink",
        )}
      >
        <Info aria-hidden className="size-3.5" strokeWidth={1.75} />
        {t.label}
      </button>
      <span
        id={tipId}
        role="tooltip"
        // NOT `cn()`: tailwind-merge reads `text-body-sm` as a colour and drops `text-menu-fg`,
        // so the tip took its parent's colour - ink on ink in the gold checkout summary.
        className={`bg-ink text-menu-fg font-body text-body-sm ease-gate absolute top-full left-0 z-20 mt-2 w-64 rounded-md px-3.5 py-3 text-left leading-snug font-normal tracking-normal normal-case shadow-lg transition-opacity duration-150 ${
          open ? "opacity-100" : "pointer-events-none opacity-0 peer-focus-visible:opacity-100"
        }`}
      >
        {t.tip}
      </span>
    </span>
  );
}
