"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { toast } from "@/components/ui/Toaster";
import { PlayGlyph } from "@/components/ui/PlayGlyph";
import { MY_PROFILE } from "@/hooks/useMyProfile";
import { ApiError } from "@/lib/api/client";
import { getPlayConnectUrl, linkPlayAccount, unlinkPlayAccount } from "@/lib/api/player";
import type { Messages } from "@/lib/utils/messages";

/**
 * BEYOND SERVICE GAME ACCOUNT on the profile card: syncing the community
 * account with the player's game account, so the API knows they are the same
 * player and the Seeds earned from playing reach them here. Worded for the
 * game account, not Google: players will sign in to the game with Google
 * Play, Apple or email (the team, 2026-11-17).
 *
 * The API's only link today is Google Play Games: CONNECT goes to Google's
 * consent page (`getPlayConnectUrl`), and Google sends the player back to
 * the profile with `?code=` (or `?error=` if they said no); that's read here
 * once, sent to the API, and cleared from the address. Linked, the panel
 * names the game player ID, with Disconnect. FLAGGED: when the API links
 * Apple or email accounts too, CONNECT needs to offer the choice.
 *
 * No frame draws this. Built from the card's own pieces: the ash panel and
 * heading of TOURNAMENT RANKINGS, EDIT PROFILE's outlined button, Log Out's
 * red for Disconnect, the standing strip's gold dot.
 */
export function PlayGamesPanel({ playGamesId, messages }: { playGamesId: string | null; messages: Messages }) {
  const t = messages.profile.play;
  const queries = useQueryClient();
  // Back from Google with `?error=` (they said no): said from the start. The card only renders in the browser.
  const [problem, setProblem] = useState<string | null>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("error") ? t.cancelled : null,
  );
  const handled = useRef(false);

  const failure = (e: unknown) => (e instanceof ApiError && e.status === 0 ? messages.auth.errors.network : t.failed);
  const refresh = () => queries.invalidateQueries({ queryKey: MY_PROFILE });

  const connect = useMutation({
    mutationFn: getPlayConnectUrl,
    onSuccess: (url) => window.location.assign(url),
    onError: (e) => setProblem(failure(e)),
  });
  const link = useMutation({
    mutationFn: linkPlayAccount,
    onSuccess: () => {
      toast(t.linked);
      void refresh();
    },
    onError: (e) => setProblem(failure(e)),
  });
  const unlink = useMutation({
    mutationFn: unlinkPlayAccount,
    onSuccess: () => {
      toast(t.unlinked);
      void refresh();
    },
    onError: (e) => setProblem(failure(e)),
  });

  // Back from Google: the code goes to the API once, and the address is tidied so a reload doesn't send it again.
  const linkWith = link.mutate;
  useEffect(() => {
    if (handled.current) return;
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");
    if (!code && !query.has("error")) return;
    handled.current = true;
    window.history.replaceState(window.history.state, "", window.location.pathname);
    if (code) linkWith(code);
  }, [linkWith]);

  const busy = connect.isPending || link.isPending || unlink.isPending;

  return (
    <section className="bg-ash mt-5.5 flex flex-col gap-5 rounded-lg px-6.5 py-5.5 md:flex-row md:items-center md:justify-between md:gap-8">
      <div className="min-w-0">
        {/* Snug, not none: the title takes two lines on a phone. */}
        <h2 className="text-menu-fg font-body text-body leading-snug tracking-[0.01em]">{t.title}</h2>
        {playGamesId ? (
          <p className="text-menu-fg font-body text-body-sm mt-4 flex items-center gap-2.5 leading-none">
            <span className="bg-gild size-1.5 shrink-0 rounded-full" aria-hidden />
            <span className="break-all">{t.connected.replace("{id}", playGamesId)}</span>
          </p>
        ) : (
          <p className="text-menu-fg/85 font-body text-body-sm mt-3.5 max-w-136 leading-snug">{t.body}</p>
        )}
        {problem ? (
          <p role="alert" className="text-flare font-body text-body-sm mt-3 leading-snug">
            {problem}
          </p>
        ) : null}
      </div>

      {playGamesId ? (
        <button
          type="button"
          onClick={() => {
            setProblem(null);
            unlink.mutate();
          }}
          disabled={busy}
          aria-busy={unlink.isPending || undefined}
          className="text-flare font-body text-body-sm focus-visible:outline-signal shrink-0 cursor-pointer self-start leading-none transition-opacity duration-150 ease-gate hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60 md:self-center"
        >
          {t.disconnect}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setProblem(null);
            connect.mutate();
          }}
          disabled={busy}
          aria-busy={busy || undefined}
          // Full width on the phone, so the label holds one line.
          className="border-menu-fg/90 text-menu-fg font-body focus-visible:outline-signal hover:bg-menu-fg/10 inline-flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-md border px-4 text-[0.9375rem] leading-none whitespace-nowrap transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60 md:w-auto"
        >
          <PlayGlyph />
          {t.connect}
        </button>
      )}
    </section>
  );
}
