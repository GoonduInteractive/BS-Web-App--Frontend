"use client";

import { useEffect, useRef } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { Messages } from "@/lib/utils/messages";

/**
 * ORDER CONFIRMED. Figma: `Success modal.png`, 699 x 482.
 *
 * A dialog rather than a page: it is what both payment paths end on, over
 * whichever screen the visitor was already looking at.
 *
 * THE FRAME DRAWS NO CLOSE CONTROL, and one is added anyway - Escape, a click on
 * the backdrop, and a labelled button. A modal whose only action is BACK TO
 * PROFILE, with no profile route built, would otherwise trap someone in it. The
 * close affordance is visually quiet so the composition is unchanged.
 *
 * FLAGGED: "You will receive an order confirmation email shortly" is not true in
 * this build. No order exists, nothing was charged, and no email is sent.
 */
export function OrderConfirmed({
  messages,
  open,
  onClose,
}: {
  messages: Messages;
  open: boolean;
  onClose: () => void;
}) {
  const t = messages.merch.confirmed;
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
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

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  // The page holds still behind the sheet (see useScrollLock); on a short
  // phone the sheet itself scrolls, so the backdrop is the scroller.
  useScrollLock(open);

  if (!open) return null;

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 grid place-items-center overflow-y-auto px-6 py-8">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className="bg-ink/70 absolute inset-0"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t.label}
        className="relative w-full max-w-[43.6875rem]"
      >
        {/* `ornaments/tear-sheet.svg`, not the delivered `tear-bg.svg`: the latter
            letterboxes inside a box that is not 843:689, and on a phone the
            sheet is tall - the title sat on white and the button on black. */}
        <div className="flex flex-col items-center bg-[url('/assets/ornaments/tear-sheet.svg')] bg-size-[100%_100%] bg-center bg-no-repeat px-6 pt-16.75 pb-15.5 text-center">
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="text-ink/50 hover:text-ink focus-visible:outline-signal absolute top-5 right-6 cursor-pointer text-[1.375rem] leading-none transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            ✕
          </button>

          {/* 124 square in the frame, signal red, with a white tick. */}
          <span aria-hidden className="bg-signal grid size-31 shrink-0 place-items-center rounded-full">
            <svg viewBox="0 0 44 34" className="text-menu-fg w-11" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 18l12 12L40 5" />
            </svg>
          </span>

          <h2 className="font-display text-ink mt-6.5 text-[2.9375rem] leading-none font-semibold tracking-[-0.04em] uppercase">
            {t.title}
          </h2>

          <p className="text-ink font-body text-body mt-4.5 max-w-135 leading-[1.5625rem]">
            {t.body}
          </p>

          <div className="mt-11">
            <BracketButton
              field="light"
              className="bg-ink px-4.75 py-[1.15rem] text-body tracking-normal"
            >
              {t.cta}
            </BracketButton>
          </div>
        </div>
      </div>
    </div>
  );
}
