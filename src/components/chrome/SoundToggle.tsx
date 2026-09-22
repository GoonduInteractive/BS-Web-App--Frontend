"use client";

import Image from "next/image";

import { useSound } from "@/components/chrome/SoundProvider";

/**
 * The global sound toggle — the bell on its torn plate.
 *
 * TWO STATES, per the human (2026-09-22): "the red line indicates that the
 * sound is muted, then it doesn't show when it is not muted. the audio icon
 * container should be a perfect straight square when muted, but when unmuted it
 * looks like what it currently is and there should be movement as if sound
 * particles is moving."
 *
 *   MUTED    the delivered icon, whose crossbar is painted in `--color-signal`,
 *            inside a plain square — a ruled border, no tear. Still.
 *   SOUND ON the same bell with the crossbar back in white, inside the torn
 *            plate Goondu delivered, with marks drifting up off the bell.
 *
 * WHERE THE SECOND ICON CAME FROM. `audio-icon.svg` draws the bell's crossbar
 * twice: once in white as part of the bell, and again in red on top of it. The
 * red is the whole of the mute signal, so `audio-icon-on.svg` is that same file
 * with the one red path removed — no art was drawn, and if Goondu redeliver the
 * icon the variant is regenerated the same way.
 *
 * THE SQUARE IS INSET 2px to sit where the torn plate's own rect sits (x 2.34
 * of 56), so the two states are the same size and the swap does not jump.
 *
 * THE STATE IS THE SITE'S, NOT THIS BUTTON'S (2026-09-22): the entry screen and
 * the chrome each draw one of these, and while they each held their own
 * `useState` the two disagreed. Both read `SoundProvider` now, which is also
 * what actually plays the bed.
 */
export function SoundToggle({ onLabel, offLabel }: { onLabel: string; offLabel: string }) {
  const { on, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? offLabel : onLabel}
      className="focus-visible:outline-signal relative grid size-14 place-items-center transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {on ? (
        <Image
          src="/assets/ornaments/audio-icon-container.svg"
          alt=""
          aria-hidden
          width={56}
          height={53}
          className="absolute inset-0 size-full select-none"
        />
      ) : (
        <span aria-hidden className="border-menu-fg absolute inset-[2px] border" />
      )}

      <Image
        src={on ? "/assets/ornaments/audio-icon-on.svg" : "/assets/ornaments/audio-icon.svg"}
        alt=""
        aria-hidden
        width={36}
        height={36}
        className="relative size-6 select-none"
      />

      {/* The marks that say it is ringing: three small squares — the site's own
          shape, the one the tabs and the rail use — drifting up off the bell's
          shoulders and fading, on staggered loops so they never pulse together.
          Decorative, so they are hidden from assistive tech, and the global
          reduced-motion rule stops them for anyone who has asked. */}
      {on ? (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span className="bg-menu-fg sound-mote absolute top-[1.125rem] left-[0.9375rem] size-[3px]" />
          <span className="bg-menu-fg sound-mote absolute top-[1.375rem] right-[0.9375rem] size-[3px] [animation-delay:600ms]" />
          <span className="bg-menu-fg sound-mote absolute top-[0.875rem] left-1/2 size-[3px] [animation-delay:1200ms]" />
        </span>
      ) : null}
    </button>
  );
}
