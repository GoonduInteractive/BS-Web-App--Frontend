"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/utils/cn";

/**
 * A modal on the torn white sheet - the delivered `merch/tear-bg.svg`,
 * stretched to the panel the way the order
 * confirmation stretches it - via `ornaments/tear-sheet.svg`, which is that
 * file with ONE attribute added: `preserveAspectRatio="none"`. Without it the
 * artwork keeps its 843:689 ratio inside whatever box it is given and
 * letterboxes, so on a 332 x 732 phone sheet the white painted a 271px band
 * through the middle and the copy sat on the backdrop. The BracketButton's
 * hover art carries the same attribute for the same reason. Nothing else in
 * the file differs, and the teeth stretch with the box as TornSurface's note
 * says they will - anisotropic on a phone, exact at the frame's ratio. The Competition frames add two more of these
 * (JOIN TOURNAMENT, REGISTRATION SUCCESSFUL), so the shell is now shared:
 * backdrop, focus trap, Escape, scroll lock, focus restore, and the close
 * control. What goes on the sheet is the caller's.
 *
 * THE CLOSE CONTROL IS THE DELIVERED `x-cancl-x.svg`, at the top right where the
 * Register frame draws it. The Success frame draws no close control, as the
 * merch one did not; the reasoning there stands - a dialog whose only action
 * navigates away must still be dismissible - so every TornDialog has one.
 *
 * PORTALLED TO BODY, and that is a correction, not a preference. The first
 * caller sits inside a `Reveal`, whose `translate` - even the settled
 * `translate: 0 0` - makes it the containing block for `position: fixed`, so
 * an in-place dialog centred itself in the featured card rather than the
 * viewport. Rendering into `document.body` puts it back where fixed means.
 *
 * `OrderConfirmed` predates this and keeps its own copy of the same logic; it
 * could adopt this shell without a visible change, and has not been touched.
 */
export function TornDialog({
  open,
  onClose,
  label,
  closeLabel,
  maxWidthClassName,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** The dialog's accessible name. */
  label: string;
  closeLabel: string;
  /** The panel's width cap - the frame's sheet width. */
  maxWidthClassName: string;
  /** Padding and layout for the sheet's content. */
  className?: string;
  children: ReactNode;
}) {
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
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  // The page holds still behind the sheet; the sheet's own scroller (a tall
  // phone sheet scrolls) carries `data-lenis-prevent` so the wheel reaches it.
  useScrollLock(open);

  if (!open) return null;

  return createPortal(
    <div data-lenis-prevent className="fixed inset-0 z-50 grid place-items-center overflow-y-auto px-6 py-8">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className="bg-ink/70 fixed inset-0 cursor-default"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn("relative w-full", maxWidthClassName)}
      >
        <div
          className={cn(
            "relative bg-[url('/assets/ornaments/tear-sheet.svg')] bg-size-[100%_100%] bg-center bg-no-repeat",
            className,
          )}
        >
          {/* 26 x 28, its ink at the frame's 753..774 x 62..82 on the 844 sheet. */}
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="focus-visible:outline-signal absolute top-[3.625rem] right-[4.1875rem] cursor-pointer transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 max-sm:top-6 max-sm:right-6"
          >
            <Image
              src="/assets/competition/x-cancl-x.svg"
              alt=""
              aria-hidden
              width={26}
              height={28}
              className="h-7 w-6.5 select-none"
            />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
