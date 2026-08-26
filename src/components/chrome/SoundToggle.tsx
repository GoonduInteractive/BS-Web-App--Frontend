"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Global sound toggle, bottom-left (overview section 3).
 *
 * The torn square is a separate SVG from the speaker glyph, so the frame keeps
 * its ragged edge independent of the icon state.
 *
 * Audio itself is not wired yet — the entry choice is what unlocks autoplay
 * (motion moment 7), and that sequence is not built. This is the control only.
 */
export function SoundToggle({ onLabel, offLabel }: { onLabel: string; offLabel: string }) {
  const [on, setOn] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      aria-label={on ? offLabel : onLabel}
      className="relative grid size-14 place-items-center transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      <Image
        src="/assets/ornaments/audio-icon-container.svg"
        alt=""
        aria-hidden
        width={56}
        height={53}
        className="absolute inset-0 size-full select-none"
      />
      <Image
        src="/assets/ornaments/audio-icon.svg"
        alt=""
        aria-hidden
        width={36}
        height={36}
        className="relative size-6 select-none"
      />
    </button>
  );
}
