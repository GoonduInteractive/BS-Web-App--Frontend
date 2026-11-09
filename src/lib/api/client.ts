import axios, { isAxiosError } from "axios";
import { z } from "zod";

/**
 * The game backend: Goondu's Beyond Service API. Every adapter in `lib/api/*`
 * that reads or writes real data goes through here; components never see
 * Axios, the URL or the reply's envelope.
 *
 * THE BASE URL IS `NEXT_PUBLIC_API_URL`, and it is required: `next.config.ts`
 * stops the build without it. Public because the browser calls it too: signing
 * in, the player's own data.
 *
 * EVERY REPLY IS AN ENVELOPE, `{ success, status, message, data }`. The
 * request functions return `data`, checked with the adapter's Zod schema, so a
 * field the backend renames fails loudly here instead of rendering blank. A
 * refusal comes back as `{ success: false, message, code }` and becomes an
 * `ApiError`.
 *
 * THE TIMEOUT IS LONG ON PURPOSE. The API runs on Render, which puts it to sleep
 * when idle and takes up to a minute to wake; the first call after a quiet
 * spell is slow, not broken.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const http = axios.create({ baseURL: BASE_URL, timeout: 90_000, headers: { Accept: "application/json" } });

const envelope = z.object({ data: z.unknown() });
const refusal = z.object({ message: z.string(), code: z.string().optional() });

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** One call. `token` is the signed-in player's access token, for their own data. */
export async function apiRequest<S extends z.ZodType>(
  method: Method,
  path: string,
  schema: S,
  { body, token }: { body?: unknown; token?: string } = {},
): Promise<z.output<S>> {
  if (!BASE_URL) throw new ApiError(0, `${method} ${path}: NEXT_PUBLIC_API_URL is not set`);

  let reply: unknown;
  try {
    reply = (
      await http.request({
        method,
        url: path,
        data: body,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
    ).data;
  } catch (e) {
    if (!isAxiosError(e)) throw e;
    const refused = refusal.safeParse(e.response?.data);
    const status = e.response?.status ?? 0;
    throw new ApiError(status, refused.success ? refused.data.message : e.message, refused.data?.code);
  }

  const data = schema.safeParse(envelope.safeParse(reply).data?.data);
  if (!data.success) {
    const issue = data.error.issues[0];
    throw new ApiError(502, `${method} ${path}: unexpected reply at ${issue?.path.join(".") || "data"}: ${issue?.message}`);
  }
  return data.data;
}

export function apiGet<S extends z.ZodType>(path: string, schema: S): Promise<z.output<S>> {
  return apiRequest("GET", path, schema);
}

/** The API keeps money in kobo (`*_minor`); the site prints naira. */
export const fromMinor = (minor: number) => minor / 100;

/**
 * The name a player goes by in public - a bracket, the leaderboard: their
 * username, else their Gamer ID. NEVER AN EMAIL ADDRESS: the backend has
 * players whose Gamer ID is their email (seen 2026-10-23), and a public page
 * must not print it. Null when there is nothing safe to show.
 */
export function publicHandle(username?: string | null, gamePlayerId?: string | null): string | null {
  if (username) return username;
  if (gamePlayerId && !gamePlayerId.includes("@")) return gamePlayerId;
  return null;
}
