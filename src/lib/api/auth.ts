import { z } from "zod";

import { authUserSchema } from "@/lib/schemas/auth";
import type { AuthErrorReason, AuthUser, SignInInput, SignUpInput } from "@/types/auth";

import { AuthError } from "./auth-error";
import { ApiError, apiRequest } from "./client";
import {
  authedRequest,
  clearPending,
  clearTokens,
  readPending,
  readTokens,
  savePending,
  saveTokens,
  tokensSchema,
  type Tokens,
} from "./session";

export { AuthError };

/**
 * Accounts and the session, on the game backend: `/v1/auth/*` and the player's
 * profile.
 *
 * Probed 2026-10-23: a wrong password is a 401 "Invalid credentials";
 * forgot-password and resend answer 200 for any address. Since 2026-10-28 the
 * emails carry a 6-digit code, not a link: a wrong or expired one is a 401
 * "Invalid or expired code". What the API says for a taken email, or for
 * signing in before confirming, isn't documented: the reasons below read the
 * status and the message. Sign-up takes no Gamer ID since 2026-11-02.
 */

/** The avatar the profile frames draw, Soma's render, until the player sets their own. */
const DEFAULT_AVATAR = "/assets/comics/soma-gate-character.png";

const profileSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  username: z.string().nullish(),
  game_player_id: z.string().nullish(),
  avatar_url: z.string().nullish(),
  email_verified: z.boolean().optional(),
});
type Profile = z.output<typeof profileSchema>;

function toUser(p: Profile): AuthUser {
  return authUserSchema.parse({
    id: p.id,
    firstName: p.first_name ?? "",
    lastName: p.last_name ?? "",
    email: p.email,
    handle: `@${p.username || p.game_player_id || p.email.split("@")[0]}`,
    avatar: p.avatar_url || DEFAULT_AVATAR,
  });
}

const profile = (tokens?: Tokens) => authedRequest("GET", "/v1/player/profile", profileSchema, undefined, tokens);

/** The form's reason for a failed call. `on401` is what a 401 means for this call. */
function reasonFor(e: unknown, on401: AuthErrorReason): AuthError {
  if (e instanceof AuthError) return e;
  if (!(e instanceof ApiError)) return new AuthError("unknown");
  if (e.status === 0) return new AuthError("network");
  if (e.status === 401) return new AuthError(on401);
  if (e.status === 403 && /verif|confirm/i.test(e.message)) return new AuthError("unverified");
  if (e.status === 409 || /already|exists|taken|in use/i.test(e.message)) return new AuthError("email-taken");
  return new AuthError("unknown");
}

/** The signed-in player, or null. Signed out if the tokens are dead. */
export async function getSession(): Promise<AuthUser | null> {
  if (!readTokens()) return null;
  try {
    return toUser(await profile());
  } catch {
    return null;
  }
}

/**
 * Creates the account. The API answers with tokens, but the player isn't
 * signed in until they confirm their email: the pair waits as pending.
 */
export async function signUp(input: SignUpInput): Promise<void> {
  try {
    const tokens = await apiRequest("POST", "/v1/auth/create", tokensSchema, {
      body: {
        email: input.email.trim(),
        password: input.password,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        region_id: input.regionId,
      },
    });
    savePending({ ...tokens, email: input.email.trim() });
  } catch (e) {
    throw reasonFor(e, "unknown");
  }
}

/** Throws `unverified` for an account whose email isn't confirmed yet. */
export async function signIn(input: SignInInput): Promise<AuthUser> {
  try {
    const tokens = await apiRequest("POST", "/v1/auth/login", tokensSchema, {
      body: { email: input.email.trim(), password: input.password },
    });
    const p = await profile(tokens);
    if (p.email_verified === false) {
      savePending({ ...tokens, email: p.email });
      throw new AuthError("unverified");
    }
    saveTokens(tokens);
    clearPending();
    return toUser(p);
  } catch (e) {
    throw reasonFor(e, "invalid-credentials");
  }
}

export async function signOut(): Promise<void> {
  clearTokens();
  clearPending();
}

/**
 * The emailed code, entered on Confirm Email. In the browser that signed up,
 * the pending pair becomes the session and the player is returned; on any
 * other device there is no pair, so null: they sign in.
 */
export async function verifyEmail(email: string, code: string): Promise<AuthUser | null> {
  try {
    await apiRequest("POST", "/v1/auth/verify-email", z.unknown(), { body: { email: email.trim(), code: code.trim() } });
  } catch (e) {
    throw reasonFor(e, "invalid-code");
  }
  const pending = readPending();
  clearPending();
  if (!pending) return null;
  const tokens = { access: pending.access, refresh: pending.refresh };
  saveTokens(tokens);
  try {
    return toUser(await profile(tokens));
  } catch {
    return null;
  }
}

export async function resendVerification(email: string): Promise<void> {
  try {
    await apiRequest("POST", "/v1/auth/resend-verification", z.unknown(), { body: { email: email.trim() } });
  } catch (e) {
    throw reasonFor(e, "unknown");
  }
}

/** Says nothing about whether the address has an account; neither does the API. */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await apiRequest("POST", "/v1/auth/forgot-password", z.unknown(), { body: { email: email.trim() } });
  } catch (e) {
    throw reasonFor(e, "unknown");
  }
}

export async function resetPassword(email: string, code: string, password: string): Promise<void> {
  try {
    await apiRequest("POST", "/v1/auth/reset-password", z.unknown(), {
      body: { email: email.trim(), code: code.trim(), password },
    });
  } catch (e) {
    throw reasonFor(e, "invalid-code");
  }
}
