import { z } from "zod";

import type { PlayerNotification } from "@/types/seeds";

import { authedRequest } from "./session";

/**
 * What the API tells the signed-in player, read as them in the browser:
 *
 *   GET   /v1/notifications            getMyNotifications(): the latest, and how many are unread
 *   PATCH /v1/notifications/{id}/read  markNotificationRead()
 *   PATCH /v1/notifications/read-all   markAllNotificationsRead()
 *
 * `GET /v1/notifications/{id}` isn't used: the list carries everything the
 * bell shows. A notification's `cta_url` is where it leads, when it leads
 * anywhere; its `key` (e.g. "acc-04") is the backend's own tracker id and
 * isn't shown.
 */

/** How many the bell shows. */
const LATEST = 20;

const apiNotification = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().default(""),
  read: z.boolean().default(false),
  // When it was read; a notification with one is read whatever `read` says.
  read_at: z.string().nullish(),
  sent_at: z.string(),
  cta_url: z.string().nullish(),
});

export async function getMyNotifications(): Promise<{ items: readonly PlayerNotification[]; unread: number }> {
  const reply = await authedRequest(
    "GET",
    `/v1/notifications?page=1&limit=${LATEST}`,
    z.object({ items: z.array(apiNotification).default([]), unread_count: z.coerce.number().default(0) }),
  );
  return {
    items: reply.items.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      read: n.read || !!n.read_at,
      sentAt: n.sent_at,
      ...(n.cta_url && { href: n.cta_url }),
    })),
    unread: reply.unread_count,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await authedRequest("PATCH", `/v1/notifications/${encodeURIComponent(id)}/read`, z.unknown());
}

export async function markAllNotificationsRead(): Promise<void> {
  await authedRequest("PATCH", "/v1/notifications/read-all", z.unknown());
}
