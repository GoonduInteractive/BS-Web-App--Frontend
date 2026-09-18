"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The locale and its copy, for the one place a Server Component cannot hand
 * them down: `not-found.tsx`. Next renders a not-found boundary with no
 * params, so the designed 404 (see `NotFoundView`) reads them from here
 * instead. The layout mounts it; the messages it carries are the same object
 * `SiteChrome` already receives, so nothing new crosses to the client.
 */
const LocaleContext = createContext<{ locale: Locale; messages: Messages } | null>(null);

export function useLocaleMessages() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocaleMessages must be used inside LocaleProvider");
  return ctx;
}

export function LocaleProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, messages }}>{children}</LocaleContext.Provider>;
}
