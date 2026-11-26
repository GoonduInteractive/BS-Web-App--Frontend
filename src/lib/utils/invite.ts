/**
 * Invite links (the backend, 2026-11-19): Create Account with the inviting
 * player's referral code and, from the Active Player Map, the region they're
 * bringing friends to. Sign-up reads both (`readInvite`), shows them fixed,
 * and sends the code as `referral_code`.
 *
 *   /en/sign-up?ref=ada&region=lagos
 *
 * THE CODE IS THE PLAYER'S `referral_code` (spec of 2026-11-20), the same
 * value as their username, which the API generates at sign-up when none is
 * given. The region is its slug, readable in a shared link; sign-up also
 * takes an id or a name.
 */

/**
 * What a code may look like: a username's characters (Edit Profile's rule,
 * without the @), with room for a generated one's length. Anything else in
 * `?ref=` is ignored rather than sent.
 */
const CODE = /^[a-zA-Z0-9_.-]{2,64}$/;

/** The path an invite opens: Create Account in the inviter's language. */
export function inviteHref(locale: string, { code, region }: { code?: string | null; region?: string | null } = {}): string {
  const params = new URLSearchParams();
  if (code) params.set("ref", code);
  if (region) params.set("region", region);
  const query = params.toString();
  return `/${locale}/sign-up${query ? `?${query}` : ""}`;
}

/** The referral code a link carries, or nothing for anything that can't be one. */
export function readReferral(raw: string | null): string | null {
  const code = raw?.trim().replace(/^@/, "") ?? "";
  return CODE.test(code) ? code : null;
}

/** The region a link names, by slug, id or name, ignoring case; null when it names none of them. */
export function readInviteRegion<R extends { id: string; slug: string; name: string }>(raw: string | null, regions: readonly R[]): R | null {
  const asked = raw?.trim().toLowerCase();
  if (!asked) return null;
  return (
    regions.find((r) => r.slug.toLowerCase() === asked) ??
    regions.find((r) => r.id.toLowerCase() === asked) ??
    regions.find((r) => r.name.toLowerCase() === asked) ??
    null
  );
}
