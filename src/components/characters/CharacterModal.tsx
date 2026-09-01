"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { BracketButton } from "@/components/ui/BracketButton";

export type RosterEntry = {
  name: string;
  role?: string;
  alt: string;
  image: string;
  /** Portrait framing override, as literal Tailwind classes. See CharacterCard. */
  portraitClass?: string;
  /** The modal's bio paragraphs. Absent for anyone Content has not written yet. */
  bio?: string[];
  /** The character's own detail page. SEE FULL DETAILS goes here. */
  href: string;
};


export function CharacterModal({
  entry,
  cta,
  closeLabel,
  onClose,
}: {
  entry: RosterEntry;
  cta: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closer = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    closer.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

    /**
     * LOCKING THE PAGE BEHIND THE DIALOG, AND WHY THE OLD ONE LINE DID NOTHING.
     *
     * It set `document.body.style.overflow = "hidden"` and that failed twice
     * over. The scrolling element on this site is the ROOT, not the body — the
     * body has no height of its own — so an overflow on the body locks nothing.
     * And Lenis does not read overflow at all: it listens for wheel events and
     * calls `scrollTo` itself, so even a correct lock leaves it driving the page
     * under the dialog. Which is exactly what happened — the wheel scrolled the
     * roster behind the modal, and the only thing that moved the modal was
     * dragging its scrollbar.
     *
     * So both are handled. `overflow: hidden` on the ROOT stops the document,
     * and `data-lenis-prevent` on the overlay (below) stops Lenis claiming the
     * wheel inside it, which hands those events back to the browser and lets the
     * dialog's own scroll region work natively.
     *
     * The scroll position is pinned and restored, because locking the root
     * collapses the scrollbar and the page would otherwise jump to the top
     * behind the dialog and be somewhere else on close.
     */
    const root = document.documentElement;
    const previous = root.style.overflow;
    const y = window.scrollY;
    root.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = previous;
      window.scrollTo({ top: y, behavior: "instant" });
    };
  }, [onClose]);

  return (
    <div
      // `data-lenis-prevent` is the whole fix for the wheel. Lenis walks up from
      // the event target looking for it and, finding it, leaves the event to the
      // browser — so the scroll region inside this overlay behaves natively
      // instead of being swallowed and applied to the page behind.
      data-lenis-prevent
      className="scrollbar-none fixed inset-0 z-50 flex justify-center overflow-y-auto p-4 md:p-6"
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
          className="text-ink focus-visible:outline-ink absolute top-9 right-9 z-10 cursor-pointer p-2 transition-opacity duration-150 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 md:top-14.5 md:right-16.5"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
            <path
              d="M2 2 18 18M18 2 2 18"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="square"
            />
          </svg>
        </button>

        <div className="relative flex flex-col gap-8 px-8 py-10 md:flex-row md:gap-16.75 md:py-19.75 md:pr-31.75 md:pl-15.75">

          <div className="bg-scar relative w-full shrink-0 overflow-hidden md:h-99.75 md:w-79.5">
            <div className="relative aspect-318/399 md:h-full md:w-full">
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
                  className="object-cover object-top"
                />
              )}
              <CornerMarks />
            </div>
          </div>

          <div className="scrollbar-none flex min-w-0 flex-1 flex-col md:max-h-99.75 md:overflow-y-auto md:overscroll-contain md:pr-4">
            <h2 className="font-display text-ink text-story-title leading-none font-semibold tracking-[-0.065em] uppercase">
              {entry.name}
            </h2>
            {entry.role ? (
              <p className="font-display text-graphite text-h7 mt-7.75 leading-none font-bold tracking-[0.06em] uppercase">
                {entry.role}
              </p>
            ) : null}

            {/* Absent, not empty, for the eight characters with no copy yet. */}
            {entry.bio?.length ? (
              <div className="mt-11.25 flex max-w-149.25 flex-col gap-6.25">
                {entry.bio.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="text-graphite font-body text-body">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="mt-auto flex justify-end pt-10">
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
        { k: "tl", box: "border-t-2 border-l-2", near: "top-[13px] left-[16px]", far: "top-[18px] left-[11px]" },
        { k: "tr", box: "border-t-2 border-r-2", near: "top-[13px] right-[16px]", far: "top-[18px] right-[11px]" },
        { k: "bl", box: "border-b-2 border-l-2", near: "bottom-[13px] left-[16px]", far: "bottom-[18px] left-[11px]" },
        { k: "br", box: "border-b-2 border-r-2", near: "bottom-[13px] right-[16px]", far: "bottom-[18px] right-[11px]" },
      ].map((c) => (
        <span key={c.k} aria-hidden>
          <span className={`border-clot absolute z-10 h-6.75 w-7.75 ${c.box} ${c.near}`} />
          <span className={`border-clot absolute z-10 h-6.75 w-7.75 ${c.box} ${c.far}`} />
        </span>
      ))}
    </>
  );
}
