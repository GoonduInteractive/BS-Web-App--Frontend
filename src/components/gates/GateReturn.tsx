"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useGateEntry } from "@/components/gates/GateEntry";
import { TornPlate } from "@/components/ui/TornPlate";
import { gateFromPathname } from "@/lib/gates";

/**
 * The way back out of a gate's page and up to the gate itself.
 *
 * The mirror of the gate CTA: that one tears from the gate into the page, this
 * one tears from the page back to the gate. `GateEntry` owns both moves.
 *
 * ON THE TORN CHIP, per the frame — the same cream plate the Ọnụ Ụzọ chip uses,
 * with a left arrow and dark text on it. It is wider than the gate chip (131 vs
 * 96 in the 1440 frame), which is why it draws the plate through `TornPlate`
 * rather than the fixed-size background `Chip` uses.
 *
 * IT IS A BUTTON, NOT A LINK. Its destination is the portal standing at THIS
 * page's door — a place, not just an address: `/en` alone would open the
 * portal on whatever it last showed. `showGate` names the door and navigates
 * home with the tear; the gate is read off the route, so every page's chip is
 * the same element with no props to get wrong.
 *
 * WITH `href` IT IS A LINK, on the same plate. The tournament detail page's
 * BACK TO TOURNAMENTS goes somewhere — back to the competition route — so there
 * it renders a `next/link`; the styling is shared, only the element changes.
 */
export function GateReturn({ label, href }: { label: string; href?: string }) {
  const { showGate } = useGateEntry();
  const gate = gateFromPathname(usePathname());

  const body = (
    <>
      <TornPlate className="text-gild" />
      {/* 12 x 10 in the frame: a long thin shaft with a small open head, not the
          stubby glyph most faces give for U+2190. Drawn so it matches. */}
      <svg
        aria-hidden
        viewBox="0 0 14 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        className="h-3 w-3.5 shrink-0"
      >
        <path d="M13.2 6H1M1 6 6 1M1 6 6 11" />
      </svg>
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={CHIP}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => gate && showGate(gate.id)} className={CHIP}>
      {body}
    </button>
  );
}

// BODY FACE, NOT DISPLAY. The frame sets this label in the grotesque, not in
// condensed Teko — wide round counters, an 11px cap on a 12px arrow. The Ọnụ
// Ụzọ chip on the gates is Teko and stays that way; these two chips share a
// plate, not a typeface.
//
// The frame measures: chip 131 wide = 16 padding + 12 arrow + 10 gap + 77 label
// + 16 padding. Every one of those is below.
//
// `isolate` keeps the plate's -z-10 inside the control rather than letting it
// fall behind the hero's scrim.
const CHIP =
  "text-ink font-body focus-visible:outline-signal relative isolate inline-flex h-7.5 cursor-pointer items-center gap-2.5 px-4 text-caption leading-none font-semibold transition-opacity duration-150 ease-gate hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4";
