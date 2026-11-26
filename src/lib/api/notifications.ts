import { z } from "zod";

import { HEDERA_ON } from "@/lib/hedera/mode";
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
  const [reply, hedera] = await Promise.all([
    authedRequest(
      "GET",
      `/v1/notifications?page=1&limit=${LATEST}`,
      z.object({ items: z.array(apiNotification).default([]), unread_count: z.coerce.number().default(0) }),
    ),
    hederaNotices(),
  ]);
  const items: PlayerNotification[] = reply.items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    read: n.read || !!n.read_at,
    sentAt: n.sent_at,
    ...(n.cta_url && { href: n.cta_url }),
  }));
  return {
    items: [...items, ...hedera].sort((a, b) => b.sentAt.localeCompare(a.sentAt)).slice(0, LATEST),
    unread: reply.unread_count + hedera.filter((n) => !n.read).length,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  if (HEDERA_ON && id.startsWith(HEDERA_PREFIX)) return (await import("./hedera")).readHederaNotices([id]);
  await authedRequest("PATCH", `/v1/notifications/${encodeURIComponent(id)}/read`, z.unknown());
}

export async function markAllNotificationsRead(): Promise<void> {
  if (HEDERA_ON) {
    const hedera = await import("./hedera");
    await hedera.readHederaNotices((await hedera.getHederaNotices()).map((n) => n.id));
  }
  await authedRequest("PATCH", "/v1/notifications/read-all", z.unknown());
}

/**
 * WHILE THE HEDERA SECTION RUNS ON MOCK DATA, its notifications (an identity
 * check asked for, sent back or confirmed; a prize sent) come from the mock
 * and are merged in here, so the bell shows the KYC flow (the team,
 * 2026-11-23). Live they are ordinary API rows and this goes. Imported only
 * when the section is on, so the mock never ships with the bell otherwise.
 */
const HEDERA_PREFIX = "hedera-";

async function hederaNotices(): Promise<PlayerNotification[]> {
  if (!HEDERA_ON) return [];
  try {
    return await (await import("./hedera")).getHederaNotices();
  } catch {
    return [];
  }
}
