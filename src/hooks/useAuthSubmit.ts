"use client";

import { useCallback, useRef, useState } from "react";

import { AuthError } from "@/lib/api/auth";
import type { AuthErrorReason } from "@/types/auth";

type Outcome<T> = { ok: true; value: T } | { ok: false; reason: AuthErrorReason | "busy" };

/**
 * One auth call at a time, and why the last one failed. A second press while
 * one is in flight does nothing. Anything that is not an `AuthError` reads as
 * `unknown`, so a raw exception never reaches the page.
 *
 * `run` hands back the outcome as well as setting `error`, so a caller can act
 * on a reason (Sign In sends `unverified` to Confirm Email) in the same tick.
 */
export function useAuthSubmit() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthErrorReason | null>(null);
  // A ref as well as state: two presses in one frame both see `pending` false.
  const busy = useRef(false);

  const run = useCallback(async <T>(call: () => Promise<T>): Promise<Outcome<T>> => {
    if (busy.current) return { ok: false, reason: "busy" };
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      return { ok: true, value: await call() };
    } catch (caught) {
      const reason = caught instanceof AuthError ? caught.reason : "unknown";
      setError(reason);
      return { ok: false, reason };
    } finally {
      busy.current = false;
      setPending(false);
    }
  }, []);

  return { pending, error, run };
}
