"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { useScrollLock } from "@/hooks/useScrollLock";

/*
 * THE PHONE SHEET is its own frame, `04-characters/mobile.png` (a 322-wide sheet):
 *
 *   close     glyph 16 x 17 at 279..294 x 23..39
 *   plate     21..242 x 57..273 - 222 x 217, LEFT-aligned at 69% of the sheet,
 *             not full width; the double corner marks inside it
 *   name      cap 40 at 297 → 63px Teko, 24 under the plate
 *   role      cap 10 at 360 → 18px Teko bold, 24 under the name's cap
 *   bio       16 / 25 from 397, in a 22..300 box; runs past the frame's foot,
 *             so the whole sheet scrolls, as it does here
 *
 * The desktop frame's geometry is unchanged from `md`.
 */
export type RosterEntry = {
  name: string;
  role?: string;
  alt: string;
  image: string;
  /** Portrait framing override, as literal Tailwind classes. See CharacterCard. */
  portraitClass?: string;
  /** Extra classes for the fill portrait - Omalicha's mask. See the manifest. */
  figureClass?: string;
  /** The modal's bio paragraphs. Absent for anyone Content has not written yet. */
  bio?: string[];
  /** The character's own detail page. SEE FULL DETAILS goes here. */
  href: string;
};

export function CharacterModal({
  entry,
  cta,
  closeLabel,
  onClose
}: {
  entry: RosterEntry;
  cta: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const bio = useRef<HTMLDivElement>(null);
  useScrollLock(true);

  // "There is more below": while the bio can scroll and has not reached its
  // end, its foot fades. Two facts read off the scroller itself, on layout and
  // on scroll, written as a data attribute the CSS keys off. No state - a
  // render for every scroll event is the one thing this must not cost.
  useEffect(() => {
    const el = bio.current;
    if (!el) return;
    const update = () => {
      const more = el.scrollHeight - el.clientHeight - el.scrollTop > 4;
      el.toggleAttribute("data-more", more);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    // Focus goes to the close control and, when the dialog goes, back to the
    // card that opened it - the visitor is returned to where they were.
    const opener = document.activeElement as HTMLElement | null;
    closer.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    // The page is held still by `useScrollLock`; the dialog's own scrollers
    // carry `data-lenis-prevent` so the wheel reaches them.
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto p-4 md:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div aria-hidden className="bg-ink/70 absolute inset-0" />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={entry.name}
        onClick={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-313"
      >
        <Image
          src="/assets/characters/modal-bg.png"
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 1279px) 100vw, 1252px"
          className="pointer-events-none object-fill"
        />

        <button
          ref={closer}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="text-ink focus-visible:outline-ink absolute top-3.75 right-4.75 z-10 cursor-pointer p-2 transition-opacity duration-150 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 md:top-14.5 md:right-16.5"
        >
          <Image
            src="/assets/characters/X-CANCEL.svg"
            alt=""
            aria-hidden
            width={22}
            height={24}
            className="h-4.25 w-4 md:h-6 md:w-5.5"
          />
        </button>

        <div className="relative flex flex-col gap-1.75 px-5.25 pt-14.25 pb-10 md:flex-row md:gap-16.75 md:py-19.75 md:pr-31.75 md:pl-15.75">
          <div className="bg-scar relative w-[79.5%] shrink-0 overflow-hidden md:h-99.75 md:w-79.5">
            <div className="relative aspect-222/217 md:h-full md:w-full">
              {entry.portraitClass ? (
                <Image
                  src={entry.image}
                  alt={entry.alt}
                  width={1230}
                  height={1539}
                  sizes="(max-width: 767px) 90vw, 318px"
                  className={`absolute h-auto max-w-none ${entry.portraitClass}`}
                />
              ) : (
                <Image
                  src={entry.image}
                  alt={entry.alt}
                  fill
                  sizes="(max-width: 767px) 90vw, 318px"
                  className={`object-cover object-top ${entry.figureClass ?? ""}`}
                />
              )}
              <CornerMarks />
            </div>
          </div>

          {/* THE COPY COLUMN. Some bios run longer than others, so the column is
              allowed to grow to the viewport before it scrolls (never shorter than
              the portrait beside it, which is the frame's height), and when it
              does scroll it is the BIO that scrolls: the name and role stay put
              above it and SEE FULL DETAILS stays put below, always in reach. The
              scroller is thin and in the sheet's own red, and `overscroll-contain`
              keeps the end of the bio from handing the wheel on to the page. */}
          <div className="flex min-w-0 flex-1 flex-col md:min-h-99.75 md:max-h-[calc(100dvh-14rem)]">
            <h2 className="font-display text-ink text-[3.9375rem] leading-none font-semibold tracking-[-0.065em] uppercase md:text-story-title">
              {entry.name}
            </h2>
            {entry.role ? (
              <p className="font-display text-graphite text-h7 mt-1.75 leading-none font-bold tracking-[0.06em] uppercase md:mt-7.75">
                {entry.role}
              </p>
            ) : null}

            {/* Absent, not empty, for the eight characters with no copy yet. */}
            {entry.bio?.length ? (
              <div
                ref={bio}
                data-lenis-prevent
                className="mt-4.25 flex min-h-0 max-w-149.25 flex-col gap-6.25 md:mt-11.25 md:overflow-y-auto md:overscroll-contain md:pr-4 md:[scrollbar-width:thin] md:[scrollbar-color:var(--color-clot)_transparent] md:data-more:[mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]"
              >
                {entry.bio.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="text-graphite font-body text-body"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="mt-auto flex shrink-0 justify-end pt-10">
              <Link
                href={entry.href}
                className="focus-visible:outline-ink inline-block focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <BracketButton
                  field="light"
                  tabIndex={-1}
                  className="bg-ink hover:bg-clot text-bone pointer-events-none px-5.75 py-4.75 leading-none tracking-normal"
                >
                  {cta}
                </BracketButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerMarks() {
  return (
    <>
      {[
        {
          k: "tl",
          box: "border-t-2 border-l-2",
          near: "top-[13px] left-[16px]",
          far: "top-[18px] left-[11px]"
        },
        {
          k: "tr",
          box: "border-t-2 border-r-2",
          near: "top-[13px] right-[16px]",
          far: "top-[18px] right-[11px]"
        },
        {
          k: "bl",
          box: "border-b-2 border-l-2",
          near: "bottom-[13px] left-[16px]",
          far: "bottom-[18px] left-[11px]"
        },
        {
          k: "br",
          box: "border-b-2 border-r-2",
          near: "bottom-[13px] right-[16px]",
          far: "bottom-[18px] right-[11px]"
        }
      ].map((c) => (
        <span key={c.k} aria-hidden>
          <span
            className={`border-clot absolute z-10 h-6.75 w-7.75 ${c.box} ${c.near}`}
          />
          <span
            className={`border-clot absolute z-10 h-6.75 w-7.75 ${c.box} ${c.far}`}
          />
        </span>
      ))}
    </>
  );
}
