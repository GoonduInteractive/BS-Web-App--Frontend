import { z } from "zod";

import { authedRequest } from "./session";

/**
 * The community wall, written as the signed-in player: `POST /v1/notes` and
 * `POST /v1/notes/{id}/toggle-like`. The wall itself is read on the server
 * (`lib/api/community.ts`).
 *
 * A POSTED NOTE WAITS FOR MODERATION: the API holds it as `pending` and the
 * public wall shows approved ones only. The poster sees it on their wall for
 * the visit; after a reload it is gone until an admin approves it. FLAGGED:
 * no frame or copy says so.
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

/** Likes the note, or takes the like back: the API keeps which. */
export async function toggleNoteLike(id: string): Promise<void> {
  await authedRequest("POST", `/v1/notes/${encodeURIComponent(id)}/toggle-like`, z.unknown());
}
