"use client";

import { useGateEntry } from "@/components/gates/GateEntry";
import { TornPlate } from "@/components/ui/TornPlate";

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
 * IT IS A BUTTON, NOT A LINK, and that is a correction rather than a
 * simplification. It used to be `<Link href="/[locale]/the-game">`, which is the
 * route it is already on. TransitionProvider's delegated handler cancels every
 * internal anchor click and `navigate` then returns early on a same-route href,
 * so the control was inert — it looked like a link, took a click, and did
 * nothing. It never moved anything.
 *
 * There is nothing here for an href to point at either. The gate and its page
 * are two faces of one route, so this changes which face is up rather than where
 * you are, and that is what a button is for.
 */
export function GateReturn({ label }: { label: string }) {
  const { leave } = useGateEntry();

  return (
    <button
      type="button"
      onClick={leave}
      // BODY FACE, NOT DISPLAY. The frame sets this label in the grotesque, not
      // in condensed Teko — wide round counters, an 11px cap on a 12px arrow.
      // The Ọnụ Ụzọ chip on the gates is Teko and stays that way; these two
      // chips share a plate, not a typeface.
      //
      // The frame measures: chip 131 wide = 16 padding + 12 arrow + 10 gap + 77
      // label + 16 padding. Every one of those is below.
      //
      // `isolate` keeps the plate's -z-10 inside this button rather than letting
      // it fall behind the hero's scrim.
      className="text-ink font-body focus-visible:outline-signal relative isolate inline-flex h-7.5 cursor-pointer items-center gap-2.5 px-4 text-caption leading-none font-semibold transition-opacity duration-150 ease-gate hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
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
    </button>
  );
}
