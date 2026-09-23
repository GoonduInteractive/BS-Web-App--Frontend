import axios, { isAxiosError } from "axios";

import type { Registration, RegistrationResult } from "@/types/register";

/**
 * The header's REGISTER sheet → a Google Sheet, through a Google Apps Script
 * web app (`scripts/register-sheet/Code.gs`, and the README beside it for the
 * deploy). This is the site's first real HTTP call and the one place a
 * visitor's details leave the browser.
 *
 * THE ENDPOINT IS `NEXT_PUBLIC_REGISTER_ENDPOINT`, the script's `/exec` URL.
 * Public by nature - it is in the bundle, as any form action would be - so
 * the sheet's protection is the script's own checks and the Google account
 * that owns it, not the URL's secrecy. Unset, `submitRegistration` throws
 * `RegistrationError("unconfigured")` and the sheet says the send failed.
 *
 * THE POST IS FORM-ENCODED, DELIBERATELY. Apps Script cannot answer a CORS
 * preflight, so the request has to be a "simple" one - form-encoded or
 * text/plain, no custom headers - which the browser sends without asking.
 * Apps Script then answers with a redirect to googleusercontent.com whose
 * reply carries `Access-Control-Allow-Origin: *`; the browser follows it and
 * the JSON comes back readable. `URLSearchParams` is what makes Axios send
 * `application/x-www-form-urlencoded`, and the script reads `e.parameter`.
 *
 * THE REPLY CANNOT ALWAYS BE READ, AND THAT IS GOOGLE'S DOING (2026-09-19). The
 * human submitted, the browser reported a CORS error, and the row was in the
 * sheet. The request had reached the script - `doPost` runs before anything is
 * answered - but the answer travels through Google's redirect, and when Google
 * routes that redirect through its account machinery (seen when more than one
 * Google account is signed in in the browser, and after redeploys) the final
 * response comes without the CORS header and the browser refuses to hand it
 * over. Axios then throws with no response at all. So: a reply that can be
 * read is used - that is how ALREADY REGISTERED is told apart - and a refused
 * one is followed by `confirmBlind`: the same post once more in `no-cors` mode,
 * whose response the browser never reads and never refuses. The script keeps
 * one row per email, so the second post adds nothing; its completion proves
 * the road to Google is open, which a failed network would not. In that case
 * the sheet reports success and cannot tell a repeat address - `read: false`.
 * `fetch` is used for that one call because XHR, Axios's transport, has no
 * opaque mode.
 *
 * The reply is validated by hand - `{ ok: boolean }` plus two optional fields
 * is the whole schema. Zod (the standard's validator) is not in the project
 * yet; it comes in with the first real payload. FLAGGED.
 */
export class RegistrationError extends Error {
  constructor(
    public readonly reason: "unconfigured" | "rejected" | "network" | "malformed",
    message?: string,
  ) {
    super(message ?? reason);
    this.name = "RegistrationError";
  }
}

const ENDPOINT = process.env.NEXT_PUBLIC_REGISTER_ENDPOINT;

export async function submitRegistration(registration: Registration): Promise<RegistrationResult> {
  if (!ENDPOINT) throw new RegistrationError("unconfigured", "NEXT_PUBLIC_REGISTER_ENDPOINT is not set");

  const body = new URLSearchParams(registration);

  let data: unknown;
  try {
    ({ data } = await axios.post<unknown>(ENDPOINT, body, { timeout: 15_000 }));
  } catch (error) {
    // An answer we could read but that was an HTTP error is a real failure. No
    // answer at all - refused by the browser, or lost - is not yet one: the
    // script may well have run. Confirm blind, see above.
    if (isAxiosError(error) && error.response) throw new RegistrationError("network", error.message);
    return confirmBlind(ENDPOINT, body);
  }

  if (!isReply(data)) throw new RegistrationError("malformed", "The endpoint did not answer with { ok }");
  if (!data.ok) throw new RegistrationError("rejected", data.error);

  return { ok: true, duplicate: data.duplicate === true, read: true };
}

/**
 * The same post with an opaque response. It completes if Google took it,
 * whatever Google answered, and throws only if the network did not carry it -
 * which is the one distinction the form needs when the readable reply was
 * refused. Idempotent on the sheet's side: one row per email.
 */
async function confirmBlind(endpoint: string, body: URLSearchParams): Promise<RegistrationResult> {
  try {
    await fetch(endpoint, { method: "POST", mode: "no-cors", body, signal: AbortSignal.timeout(15_000) });
  } catch (error) {
    throw new RegistrationError("network", String(error));
  }
  return { ok: true, duplicate: false, read: false };
}

type Reply = { ok: boolean; duplicate?: boolean; error?: string };

function isReply(value: unknown): value is Reply {
  return typeof value === "object" && value !== null && typeof (value as { ok?: unknown }).ok === "boolean";
}
