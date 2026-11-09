/**
 * Where to send someone once they are signed in: the `next` they arrived with,
 * if it is a path on this site, else The Game. A `next` that is a full URL or
 * `//host` is refused, so the sign-in page cannot be used to bounce a visitor
 * to someone else's site.
 */
export function afterAuthHref(locale: string, next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return `/${locale}/the-game`;
}

/** An auth route, carrying `next` along when there is one. */
export function authHref(locale: string, route: string, next?: string | null): string {
  const base = `/${locale}/${route}`;
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}
