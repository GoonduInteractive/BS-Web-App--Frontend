"use client";

import Image from "next/image";
import Link from "next/link";

import { useGateEntry } from "@/components/gates/GateEntry";
import type { GateId } from "@/lib/gates";

/**
 * The cue at the foot of a gate and of a page: a torn arrow over a label
 * naming the gate it leads to. Bottom-centred.
 *
 * TWO DESTINATIONS. With `gate` it stands the portal at that door (a button -
 * the URL does not change, see GateEntry); with `href` it is a plain
 * `next/link` to a page, and TransitionProvider's delegated click handler
 * plays the tear. Nothing here calls the transition either way.
 *
 * THE ARROW BOBS. Added at Design's request after the gates were built, to say
 * the cue is something you can act on rather than an ornament. The keyframes are
 * in globals.css so the reduced-motion block reaches them.
 *
 * The bob writes `transform` and the hover lift writes `translate`, which are
 * separate properties in Tailwind v4, so the arrow keeps bobbing as it lifts
 * instead of one cancelling the other.
 *
 * `arrow.svg` renders at its natural 23x29, which is what the frames measure
 * (21 x 29 of visible ink).
 */
export function ScrollCue({
  href,
  gate,
  label,
  arrowOnly = false,
}: {
  href?: string;
  gate?: GateId;
  label: string;
  /**
   * Only the arrow is the control; the label beneath it is plain text (the
   * human, 2026-09-26, for the gates). The arrow then carries the label as its
   * accessible name, since it has no text of its own.
   */
  arrowOnly?: boolean;
}) {
  const { showGate } = useGateEntry();
  const arrow = (
    <Image
      src="/assets/ornaments/arrow.svg"
      alt=""
      aria-hidden
      width={23}
      height={29}
      className="scroll-cue-bob h-[29px] w-[23px] transition-[translate] duration-200 ease-gate select-none group-hover:translate-y-1"
    />
  );
  const text = <span className="text-menu-fg font-display text-body-sm font-semibold tracking-[0.1em]">{label}</span>;
  const className =
    "focus-visible:outline-signal group flex cursor-pointer flex-col items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-8";

  if (arrowOnly) {
    // Same column, same gap; the control is just the arrow's box now.
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          aria-label={label}
          onClick={() => gate && showGate(gate)}
          className="focus-visible:outline-signal group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-8"
        >
          {arrow}
        </button>
        <span className="select-none">{text}</span>
      </div>
    );
  }

  const body = (
    <>
      {arrow}
      {text}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => gate && showGate(gate)} className={className}>
      {body}
    </button>
  );
}
