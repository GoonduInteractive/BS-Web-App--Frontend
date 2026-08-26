import en from "@/messages/en.json";
import ig from "@/messages/ig.json";

import type { Locale } from "./locales";

/**
 * Minimal message lookup. This is a stand-in for next-intl, which owns this in
 * chunk 1 — the JSON shape is deliberately the shape next-intl expects, so the
 * swap is a change of accessor and not a change of content.
 *
 * Copy never lives in a component. If a string is not here, ask for it in both
 * English and Igbo rather than inventing one.
 */
const MESSAGES = { en, ig } as const;

export type Messages = typeof en;

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] as Messages;
}
