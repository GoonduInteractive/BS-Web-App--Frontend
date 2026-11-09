"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { authHref } from "@/lib/utils/auth-links";

/**
 * A page that is one player's own. The page is static, so this decides in the
 * browser: nothing is drawn until the session is read, a signed-out visitor is
 * sent to Sign In with this page as `next`, and comes back here after.
 */
export function RequireAuth({ locale, children }: { locale: string; children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "signed-out") router.replace(authHref(locale, "sign-in", pathname));
  }, [status, router, locale, pathname]);

  return status === "signed-in" ? children : null;
}
