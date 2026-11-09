"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { afterAuthHref } from "@/lib/utils/auth-links";

/**
 * An auth page has nothing to offer someone already signed in (a back button,
 * an old tab). Replaced rather than pushed, so Back does not return them here.
 */
export function useRedirectIfSignedIn(locale: string, next: string | null) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "signed-in") router.replace(afterAuthHref(locale, next));
  }, [status, router, locale, next]);
}
