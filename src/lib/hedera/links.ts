/** Where a flow may send the player back to: a page of this site, in this locale. */
export function safeNext(next: string | null, locale: string): string | null {
  if (!next || next.startsWith("//") || !next.startsWith(`/${locale}/`)) return null;
  return next;
}

/** Link a wallet, then come back to `next`. */
export function connectHref(locale: string, next?: string | null): string {
  return `/${locale}/hedera/connect${next ? `?next=${encodeURIComponent(next)}` : ""}`;
}
