import { z } from "zod";

import { ApiError, apiRequest } from "./client";

/**
 * The signed-in player's tokens, in this browser, and calls made as them.
 *
 * `bs.auth` holds the access and refresh tokens of the session. `bs.auth.pending`
 * holds a pair the API handed out before the email was confirmed (sign-up
 * answers with tokens): the site waits for the confirmation link before it
 * treats anyone as signed in (human, 2026-10-03), and the link opened in this
 * browser makes the pending pair the session.
 *
 * In localStorage because the site is static: there is no server of ours to
 * hold them. FLAGGED: an httpOnly cookie set by the backend would keep them
 * out of reach of any script on the page.
 */

export const tokensSchema = z
  .object({ access_token: z.string().min(1), refresh_token: z.string().min(1) })
  .transform((t) => ({ access: t.access_token, refresh: t.refresh_token }));

export type Tokens = z.output<typeof tokensSchema>;
type Pending = Tokens & { email: string };

const SESSION_KEY = "bs.auth";
const PENDING_KEY = "bs.auth.pending";

export const readTokens = () => read<Tokens>(SESSION_KEY);
export const saveTokens = (tokens: Tokens) => write(SESSION_KEY, tokens);
export const clearTokens = () => remove(SESSION_KEY);

export const readPending = () => read<Pending>(PENDING_KEY);
export const savePending = (pending: Pending) => write(PENDING_KEY, pending);
export const clearPending = () => remove(PENDING_KEY);

/** One refresh at a time: several calls failing together share it. */
let refreshing: Promise<Tokens> | null = null;

function refresh(token: string): Promise<Tokens> {
  refreshing ??= apiRequest("POST", "/v1/auth/refresh", tokensSchema, { body: { token } })
    .then((tokens) => {
      saveTokens(tokens);
      return tokens;
    })
    .catch(() => {
      // Any failure ends the session: the API answers a dead refresh token with a 500, not a 401.
      clearTokens();
      throw new ApiError(401, "Session ended");
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/**
 * A call as the signed-in player: their access token, and on a 401 one refresh
 * and one retry. Signed out, or the refresh refused, it throws a 401 `ApiError`.
 */
export async function authedRequest<S extends z.ZodType>(
  method: Parameters<typeof apiRequest>[0],
  path: string,
  schema: S,
  body?: unknown,
  tokens: Tokens | null = readTokens(),
): Promise<z.output<S>> {
  if (!tokens) throw new ApiError(401, "Not signed in");
  try {
    return await apiRequest(method, path, schema, { body, token: tokens.access });
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 401)) throw e;
    const fresh = await refresh(tokens.refresh);
    return apiRequest(method, path, schema, { body, token: fresh.access });
  }
}

/**
 * A call as the signed-in player that outlives the page: `fetch` with
 * `keepalive`, for a report sent as a tab closes or navigates away, which
 * cancels an ordinary request. Nothing waits for the answer and there's no
 * refresh-and-retry: there may be no page left to retry from.
 */
export function authedKeepalive(method: "POST" | "PATCH" | "PUT", path: string, body: unknown): void {
  const tokens = readTokens();
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!tokens || !base) return;
  fetch(new URL(path, base), {
    method,
    keepalive: true,
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${tokens.access}` },
    body: JSON.stringify(body),
  }).catch(() => {});
}

/** Storage can be missing or throw (private windows, blocked site data). */
function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Without storage the session lasts this page only; the call itself still worked.
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing stored means nothing to remove.
  }
}
