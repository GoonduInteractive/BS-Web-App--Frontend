"use client";

import Image from "next/image";
import { useId, useState } from "react";

import { TornPanel } from "@/components/ui/TornPanel";

/**
 * One person on the About page's team band: portrait, name, role.
 *
 * WITH A BIO, A TORN NOTE (the human, 2026-11-26: "a little bit of pizzazz" -
 * a cute line on who built what). Not a modal: nothing covers the page, and a
 * visitor can read one card after another. The note is the community wall's
 * own paper - `TornPanel` in `note-cream`, the bio in the wall's hand face -
 * so it reads as someone pinned a note on their photo.
 *
 * - At rest, a small "Psst…" note peeks from the portrait's corner, so there
 *   is visibly more to see. It tucks away when the note comes up.
 * - A mouse over the portrait, a tap, or Enter/Space on it (the portrait is
 *   the button) slides the note up from the portrait's foot and tips it a few
 *   degrees, as if dropped there. A second tap, or the mouse leaving, puts it back.
 * - Reduced motion: the note fades in place, no slide or tilt.
 *
 * The bio is in the page either way, so it is read with the card and indexed;
 * the button only says whether it is showing (`aria-expanded`). A card with no
 * bio is the portrait, name and role, exactly as before.
 */
export function TeamCard({
  name,
  role,
  bio,
  image,
  imageAlt,
  portraitClass,
  noteHint,
  noteLabel,
  priority = false,
}: {
  name: string;
  role: string;
  /** A line or two of personality; absent, no note and no button. */
  bio?: string;
  image: string;
  imageAlt: string;
  portraitClass: string;
  /** The peeking note's word, "Psst…". */
  noteHint: string;
  /** The button's name, "About {name}". */
  noteLabel: string;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const noteId = useId();
  // A stable tear per person, so every note rips a little differently.
  const seed = [...name].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 7);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-6/7 w-full overflow-hidden bg-white">
        <Image
          src={image}
          alt={imageAlt}
          width={1598}
          height={1734}
          priority={priority}
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 22vw"
          className={`absolute transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${portraitClass}`}
        />

        {bio ? (
          <>
            {/* The peeking note: there's more here. Tucks away while the note is up. */}
            <div
              aria-hidden
              className={`pointer-events-none absolute right-[5%] bottom-[4%] rotate-6 transition-[opacity,translate] duration-300 ease-gate ${
                open ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <TornPanel seed={seed + 11} depth={8} frequency={0.11} bleed={4} className="text-note-cream drop-shadow-[0_6px_10px_rgb(0_0_0/0.25)]">
                <span className="font-hand text-ink block px-3.5 py-1.5 text-[0.9375rem] leading-none">{noteHint}</span>
              </TornPanel>
            </div>

            {/* The note itself, slid up from the portrait's foot and tipped as if dropped there. */}
            <div
              id={noteId}
              className={`pointer-events-none absolute inset-x-[7%] bottom-[6%] origin-bottom-left transition-[translate,rotate,opacity] duration-500 ease-gate motion-reduce:transition-opacity ${
                open ? "translate-y-0 -rotate-2 opacity-100" : "translate-y-[120%] rotate-3 opacity-0 motion-reduce:translate-y-0 motion-reduce:rotate-0"
              }`}
            >
              <TornPanel seed={seed} depth={12} frequency={0.075} bleed={6} className="text-note-cream drop-shadow-[0_14px_22px_rgb(0_0_0/0.35)]">
                <div className="relative px-5.5 pt-6 pb-5.5">
                  {/* A strip of tape holding it on. */}
                  <span aria-hidden className="bg-gild/80 absolute -top-2 left-1/2 h-4.5 w-16 -translate-x-1/2 -rotate-3" />
                  <p className="font-hand text-ink line-clamp-6 text-[1.0625rem] leading-[1.5625rem]">{bio}</p>
                </div>
              </TornPanel>
            </div>

            {/* The portrait is the button: a mouse shows the note on hover, a tap or the keyboard toggles it. */}
            <button
              type="button"
              aria-label={noteLabel}
              aria-expanded={open}
              aria-controls={noteId}
              onClick={() => setOpen((o) => !o)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
              onBlur={() => setOpen(false)}
              className="focus-visible:outline-signal absolute inset-0 cursor-pointer focus-visible:outline-3 focus-visible:-outline-offset-3"
            />
          </>
        ) : null}
      </div>

      <h3 className="font-display text-menu-fg mt-8.25 text-center text-[1.5rem] leading-[1.75rem] font-semibold tracking-[-0.05em] uppercase">
        {name}
      </h3>
      <p className="text-menu-fg font-body text-body mt-0.25 text-center">{role}</p>
    </article>
  );
}
