/**
 * The account contract, as `lib/api/auth.ts` serves it from the game backend.
 */

/** The signed-in player, as much of them as the chrome needs. */
export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Shown with its `@`, as the account menu draws it. */
  handle: string;
  /** A path or URL for the avatar the header and the menu draw. */
  avatar: string;
};

/**
 * What a new player agreed to on Create Account. The Terms of Use and Privacy
 * Policy are accepted explicitly, not only by use, because the store takes
 * payments and has a returns policy (human, 2026-10-03). The time is kept so
 * the account can show when. Marketing email is a separate choice, off unless
 * ticked.
 */
export type SignUpConsent = {
  /** ISO time the terms box was ticked and the form sent. */
  termsAcceptedAt: string;
  marketingOptIn: boolean;
};

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  /** A region's id from `/v1/regions`. The API requires it. */
  regionId: string;
} & SignUpConsent;

export type SignInInput = {
  email: string;
  password: string;
};

/**
 * Why an auth call failed. Each one maps to a line in `messages.auth.errors`,
 * except `unverified`, which sends the visitor to Confirm Email instead.
 */
export type AuthErrorReason =
  | "invalid-credentials"
  | "email-taken"
  | "unverified"
  | "invalid-code"
  | "network"
  | "unknown";
