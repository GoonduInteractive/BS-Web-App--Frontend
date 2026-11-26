import { z } from "zod";

import { authedRequest } from "./session";

/**
 * The community wall, written as the signed-in player: `POST /v1/notes` and
 * `POST /v1/notes/{id}/toggle-like`. The wall itself is read on the server
 * (`lib/api/community.ts`).
 *
 * A POSTED NOTE GOES UP AT ONCE (product's filter guide, 2026-11-17). The
 * sheet runs it through the community wall filter before it is sent
 * (`lib/community/filter.ts`); the API runs the same check behind it and takes
 * a note that fails offline (flagged) for an admin to restore or delete, and
 * emails the player.
 */

/** The API's bounds for a note, which the sheet enforces before sending. */
export const NOTE_MIN = 3;
export const NOTE_MAX = 140;

export async function postNote(content: string): Promise<{ id: string; postedAt: string }> {
  const note = await authedRequest("POST", "/v1/notes", z.object({ id: z.string(), created_at: z.string().nullish() }), {
    content,
  });
  return { id: note.id, postedAt: note.created_at ?? new Date().toISOString() };
}

/**
 * A note the sheet refused for a rule the team follows up personally -
 * self-harm, underage (the filter guide) - sent to the API so it reaches the
 * admin's queue (`POST /v1/notes/moderation-reports`, spec of 2026-11-20). The
 * note itself is never posted. `categories` are the filter's rule keys.
 */
export async function reportBlockedNote(content: string, categories: readonly string[]): Promise<void> {
  await authedRequest("POST", "/v1/notes/moderation-reports", z.unknown(), {
    content,
    categories: [...new Set(categories)].slice(0, 20),
  });
}

/** Likes the note, or takes the like back: the API keeps which. */
export async function toggleNoteLike(id: string): Promise<void> {
  await authedRequest("POST", `/v1/notes/${encodeURIComponent(id)}/toggle-like`, z.unknown());
}
