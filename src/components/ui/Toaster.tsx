"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

/**
 * A short confirmation that something happened - "Added to cart" - with an
 * optional link onward. No frame draws one; it borrows the store's dark panels
 * (`bg-ash`) and the signal red as its edge.
 *
 * `toast()` can be called from anywhere in the browser; `Toaster`, mounted
 * once in the locale layout, draws what's showing. Each one leaves after a few
 * seconds, the newest three at most. Announced politely to screen readers.
 */
type Toast = { id: number; message: string; action?: { label: string; href: string } };

const SHOWN_FOR = 4000;
let toasts: readonly Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(next: readonly Toast[]) {
  toasts = next;
  listeners.forEach((listener) => listener());
}

export function dismissToast(id: number) {
  emit(toasts.filter((t) => t.id !== id));
}

export function toast(message: string, action?: Toast["action"]) {
  const id = nextId++;
  emit([...toasts, { id, message, action }].slice(-3));
  setTimeout(() => dismissToast(id), SHOWN_FOR);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const NONE: readonly Toast[] = [];

export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => NONE,
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-60 flex flex-col items-center gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
    >
      {list.map((t) => (
        <div
          key={t.id}
          className="bg-ash border-signal text-menu-fg pointer-events-auto flex w-full max-w-sm items-center justify-between gap-4 border-l-4 px-5 py-4 shadow-lg md:w-auto md:min-w-80"
        >
          <p className="font-body text-body-sm leading-snug">{t.message}</p>
          {t.action ? (
            <Link
              href={t.action.href}
              onClick={() => dismissToast(t.id)}
              className="font-display text-signal focus-visible:outline-signal shrink-0 text-[1.0625rem] leading-none font-semibold tracking-wide uppercase transition-opacity duration-150 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t.action.label}
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}
