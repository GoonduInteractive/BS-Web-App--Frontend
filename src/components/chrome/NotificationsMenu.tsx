"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { toast } from "@/components/ui/Toaster";
import { MY_NOTIFICATIONS, useMyNotifications } from "@/hooks/useNotifications";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import { cn } from "@/lib/utils/cn";
import { isLocale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { PlayerNotification } from "@/types/seeds";

/** "3 min ago", in the page's language where the browser has it. */
function ago(iso: string, locale: string, justNow: string): string {
  const seconds = (Date.parse(iso) - Date.now()) / 1000;
  if (!Number.isFinite(seconds)) return "";
  if (seconds > -60) return justNow;
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
  ];
  const [unit, size] = [...steps].reverse().find(([, s]) => -seconds >= s) ?? steps[0];
  let format: Intl.RelativeTimeFormat;
  try {
    format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  } catch {
    format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  }
  return format.format(Math.round(seconds / size), unit);
}

/** The website's own sections a notification may open. */
const SITE_SECTIONS = new Set(["the-game", "characters", "community", "competition", "about", "news", "comics", "merch", "profile", "terms", "privacy"]);

/**
 * Where a notification leads ON THIS WEBSITE, in the page's language, or null.
 * A player stays on the site: a link to the admin, another site, or a path
 * that isn't one of the site's sections isn't followed (clicking it only
 * marks it read). The API's `cta_url` has led to the admin (the human,
 * 2026-11-18). FLAGGED: ask the backend for website paths on player notifications.
 */
function destination(href: string | undefined, locale: string): string | null {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return null;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const ours = url.origin === window.location.origin || (!!site && url.origin === new URL(site).origin);
  if (!ours) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] && isLocale(parts[0])) parts.shift();
  if (!parts[0] || !SITE_SECTIONS.has(parts[0])) return null;
  return `/${locale}/${parts.join("/")}${url.search}${url.hash}`;
}

/**
 * The signed-in player's notifications: a bell beside their avatar, with
 * the unread count on it, opening the latest under it in the account menu's
 * dark panel. Opening one marks it read and, when it leads somewhere on the
 * website, goes there; "Mark all as read" clears the count.
 *
 * READ STAYS READ. What the player marks is held here (`readHere`,
 * `allReadUpTo`) and shown read whatever the list says meanwhile: the API
 * is slow to wake on Render, and a re-read of the list (every minute, or
 * coming back to the tab) that lands before it has saved the mark used to
 * put the unread dot back. Once the API answers, the list is read again;
 * if it refused, the mark is taken back and the player told.
 *
 * No frame draws this. Built from the header's own pieces: the bell sits in
 * the avatar's circle, the panel is the account menu's.
 */
export function NotificationsMenu({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.notifications;
  const feed = useMyNotifications();
  const queries = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const [readHere, setReadHere] = useState<ReadonlySet<string>>(() => new Set());
  // "Mark all as read" covers everything up to the newest notification then shown; newer ones stay unread.
  const [allReadUpTo, setAllReadUpTo] = useState<number | null>(null);
  const isRead = (n: PlayerNotification) =>
    n.read || readHere.has(n.id) || (allReadUpTo !== null && Date.parse(n.sentAt) <= allReadUpTo);

  const items = feed.data?.items ?? [];
  // With everything marked, what's left unread is in the list (the newest come first);
  // otherwise the API's count, less what was marked here and it hasn't caught up with.
  const unread = !feed.data
    ? 0
    : allReadUpTo !== null
      ? items.filter((n) => !isRead(n)).length
      : Math.max(0, feed.data.unread - items.filter((n) => !n.read && isRead(n)).length);

  const resync = () => queries.invalidateQueries({ queryKey: MY_NOTIFICATIONS });
  const readOne = useMutation({
    mutationFn: markNotificationRead,
    onError: (_e, id) => {
      setReadHere((s) => new Set([...s].filter((x) => x !== id)));
      toast(t.markFailed);
    },
    onSettled: resync,
  });
  const readAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onError: () => {
      setAllReadUpTo(null);
      toast(t.markFailed);
    },
    onSettled: resync,
  });

  const openOne = (n: PlayerNotification) => {
    if (!isRead(n)) {
      setReadHere((s) => new Set(s).add(n.id));
      readOne.mutate(n.id);
    }
    const to = destination(n.href, locale);
    if (!to) return;
    setOpen(false);
    router.push(to);
  };

  const markAll = () => {
    const newest = Math.max(...items.map((n) => Date.parse(n.sentAt)).filter(Number.isFinite));
    setAllReadUpTo(Number.isFinite(newest) ? newest : Date.now());
    readAll.mutate();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    };
    // As the account menu: a press outside dismisses before its click lands.
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={root} className="sm:relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `${t.open}, ${t.unread.replace("{n}", String(unread))}` : t.open}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="bg-menu-fg/25 hover:bg-menu-fg/35 focus-visible:outline-signal relative grid size-8.5 cursor-pointer place-items-center rounded-full transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Bell aria-hidden className="text-menu-fg size-4.5" strokeWidth={1.75} />
        {unread > 0 ? (
          <span
            aria-hidden
            className="bg-signal text-menu-fg font-body absolute -top-1 -right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[0.6875rem] leading-none font-semibold"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t.title}
          // The phone's header leaves no room to hang it off the bell: it spans the screen under the bar.
          className="bg-menu fixed inset-x-4 top-19 z-50 rounded-md shadow-lg sm:absolute sm:inset-x-auto sm:top-[calc(100%+0.75rem)] sm:right-0 sm:w-[22.5rem]"
        >
          <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-3.5">
            <h2 className="text-menu-fg font-body text-body-sm leading-none tracking-wider uppercase">{t.title}</h2>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAll}
                className="text-menu-fg/70 hover:text-menu-fg font-body focus-visible:outline-signal cursor-pointer text-[0.8125rem] leading-none underline underline-offset-4 transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t.markAll}
              </button>
            ) : null}
          </div>
          <hr className="border-menu-fg/12" />

          {feed.isError && !feed.data ? (
            <p role="alert" className="text-menu-fg/70 font-body text-body-sm px-4 py-6 leading-snug">
              {t.error}
            </p>
          ) : !feed.data ? (
            <div aria-busy className="h-24" />
          ) : feed.data.items.length === 0 ? (
            <p className="text-menu-fg/70 font-body text-body-sm px-4 py-6 leading-snug">{t.empty}</p>
          ) : (
            <ul data-lenis-prevent className="max-h-[min(26rem,calc(100svh-9rem))] overflow-y-auto overscroll-contain">
              {items.map((n) => {
                const read = isRead(n);
                const leads = destination(n.href, locale) !== null;
                return (
                <li key={n.id} className="border-menu-fg/12 border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() => openOne(n)}
                    className="hover:bg-menu-fg/6 focus-visible:outline-signal flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", read ? "bg-transparent" : "bg-signal")} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("text-menu-fg font-body text-body-sm block leading-snug", !read && "font-semibold")}>
                        {n.title}
                      </span>
                      {n.body ? (
                        <span className="text-menu-fg/70 font-body mt-1 block text-[0.8125rem] leading-snug">{n.body}</span>
                      ) : null}
                      <span className="text-menu-fg/50 font-body mt-2 block text-[0.75rem] leading-none">
                        {ago(n.sentAt, locale, t.justNow)}
                      </span>
                    </span>
                    {leads ? (
                      <span aria-hidden className="text-menu-fg/60 self-center">
                        ›
                      </span>
                    ) : null}
                  </button>
                </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
