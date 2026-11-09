"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { formatPrice } from "@/lib/utils/price";

/**
 * Back from Paystack: "confirming" while the API hears from Paystack,
 * "confirmed" once the order is paid, "pending" if it still isn't after a
 * while. "unpaid" is the player back here without having paid (`CheckoutView`).
 */
export type ConfirmState = "confirming" | "confirmed" | "pending" | "unpaid";

/** The order as the dialog lists it, its lines already named. `read` is an online chapter's slug. */
export type OrderSummary = {
  number: string;
  total: number;
  lines: readonly { name: string; quantity: number; total: number; read?: string }[];
};

/**
 * ORDER CONFIRMED. Figma: `Success modal.png`, 699 x 482.
 *
 * A dialog rather than a page: it is what both payment paths end on, over
 * whichever screen the visitor was already looking at.
 *
 * THE FRAME DRAWS NO CLOSE CONTROL, and one is added anyway - Escape, a click on
 * the backdrop, and a labelled button, so nobody is trapped in it. The close
 * affordance is visually quiet so the composition is unchanged.
 *
 * IT CARRIES THE ORDER: its number, what was bought and the total, under
 * the frame's copy; and it has two states the frame doesn't draw, while the
 * payment is confirmed and if it isn't (FLAGGED, no frame).
 *
 * THE BUTTON IS CONTINUE SHOPPING, back to the store, not the frame's BACK TO
 * PROFILE: the profile shows nothing of an order, so it led nowhere (the
 * team, 2026-11-02).
 *
 * AN ORDER OF ONLINE COMICS ALONE SHIPS NOTHING, so the frame's copy (delivery
 * dates) is wrong for it: confirmed, it says the comics are ready and its
 * button is START READING - the reader for one chapter, the Comics page for
 * several. Comics bought with things that ship keep the frame's copy, with a
 * line that the comics can be read now. FLAGGED: no frame draws either.
 *
 * AN ORDER LEFT UNPAID IS OFFERED BACK: placing it emptied the cart, and the
 * API lists no player's orders, so this is the only way back to it. PAY NOW
 * starts its payment again. FLAGGED: no frame draws this either.
 *
 * FLAGGED: "You will receive an order confirmation email shortly" depends on the
 * backend sending one; the site sends none.
 */
export function OrderConfirmed({
  messages,
  locale,
  open,
  state = "confirmed",
  order = null,
  onClose,
  onPay,
  paying = false,
  payError,
}: {
  messages: Messages;
  locale: Locale;
  open: boolean;
  state?: ConfirmState;
  order?: OrderSummary | null;
  onClose: () => void;
  /** "unpaid": starts its payment again. */
  onPay?: () => void;
  /** "unpaid": the payment is on its way to Paystack. */
  paying?: boolean;
  /** "unpaid": why the payment didn't start. */
  payError?: string | null;
}) {
  const t = messages.merch.confirmed;
  const price = (amount: number) => formatPrice(amount, locale, messages.merch.price);
  const reads = [...new Set(order?.lines.flatMap((l) => (l.read ? [l.read] : [])) ?? [])];
  const comicsOnly = reads.length > 0 && !!order?.lines.every((l) => l.read);
  const copy =
    state === "confirming"
      ? { title: t.confirmingTitle, body: t.confirmingBody }
      : state === "pending"
        ? { title: t.pendingTitle, body: t.pendingBody }
        : state === "unpaid"
          ? { title: t.unpaidTitle, body: t.unpaidBody }
          : comicsOnly
            ? reads.length === 1
              ? { title: t.readyTitle, body: t.readyBody }
              : { title: t.readyTitleMany, body: t.readyBodyMany }
            : reads.length
              ? { title: t.title, body: `${t.body} ${t.readyAlso}` }
              : { title: t.title, body: t.body };
  // Confirmed comics are read, not waited for: the reader for one, the Comics page for several.
  const read = state === "confirmed" && comicsOnly ? (reads.length === 1 ? `/${locale}/comics/${reads[0]}` : `/${locale}/comics`) : null;
  const warns = state === "pending" || state === "unpaid";
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

          {/* 124 square in the frame, signal red, with a white tick. Confirming, a
              ring turns in its place; pending or unpaid, it holds an exclamation mark. */}
          {state === "confirming" ? (
            <span aria-hidden className="border-signal/25 border-t-signal size-31 shrink-0 animate-spin rounded-full border-8 motion-reduce:animate-none" />
          ) : (
            <span aria-hidden className={`${warns ? "bg-ink" : "bg-signal"} grid size-31 shrink-0 place-items-center rounded-full`}>
              {warns ? (
                <span className="font-display text-menu-fg text-[4.5rem] leading-none font-semibold">!</span>
              ) : (
                <svg viewBox="0 0 44 34" className="text-menu-fg w-11" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 18l12 12L40 5" />
                </svg>
              )}
            </span>
          )}

          <h2 className="font-display text-ink mt-6.5 text-[2.9375rem] leading-none font-semibold tracking-[-0.04em] uppercase">
            {copy.title}
          </h2>

          {/* The help line runs on as the paragraph's last sentence
              (`new-updates/Success modal.png`, 2026-09-26). The frame's address is
              "support@yourdomain.com", a template placeholder; every other new
              frame gives the support inbox (`support.email`), so that is what ships. */}
          <p className="text-ink font-body text-body mt-4.5 max-w-135 leading-[1.5625rem]">
            {copy.body} {t.help}{" "}
            <a
              href={`mailto:${messages.support.email}`}
              className="focus-visible:outline-signal font-semibold transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {messages.support.email}
            </a>
            .
          </p>

          {order ? (
            <div className="border-ink/15 mt-6 w-full max-w-110 border-y py-3 text-left">
              <p className="font-display text-ink text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase">
                {t.order.replace("{number}", order.number)}
              </p>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {order.lines.map((line, i) => (
                  <li key={i} className="text-ink font-body text-body-sm flex justify-between gap-4 leading-snug">
                    <span>
                      {line.name} <span className="text-ink/60">× {line.quantity}</span>
                    </span>
                    <span className="shrink-0">{price(line.total)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-ink font-body text-body mt-2.5 flex justify-between gap-4 font-semibold">
                <span>{t.total}</span>
                <span>{price(order.total)}</span>
              </p>
            </div>
          ) : null}

          {/* The added line takes its room out of this gap: the button stays where it was. */}
          <div className="mt-6.25">
            {state === "unpaid" ? (
              <BracketButton
                type="button"
                onClick={onPay}
                disabled={paying}
                aria-busy={paying || undefined}
                field="light"
                className="bg-ink px-4.75 py-[1.15rem] text-body tracking-normal"
              >
                {t.payNow}
              </BracketButton>
            ) : (
              <BracketButton
                href={read ?? `/${locale}/merch`}
                field="light"
                className="bg-ink px-4.75 py-[1.15rem] text-body tracking-normal"
              >
                {read ? t.read : t.cta}
              </BracketButton>
            )}
          </div>
          {payError ? (
            <p role="alert" className="text-signal font-body text-body-sm mt-3 leading-snug">
              {payError}
            </p>
          ) : null}
          {/* Comics ready to read, or an order to pay for, lead; shopping on is the quieter way. */}
          {read || state === "unpaid" ? (
            <Link
              href={`/${locale}/merch`}
              className="text-ink font-body text-body-sm focus-visible:outline-signal mt-4 underline underline-offset-4 transition-opacity duration-150 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t.shop}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
