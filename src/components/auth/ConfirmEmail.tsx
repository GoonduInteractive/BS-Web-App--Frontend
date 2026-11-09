"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { AuthNotice } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthSubmit } from "@/components/auth/AuthSubmit";
import { errorLine } from "@/components/auth/errors";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { toast } from "@/components/ui/Toaster";
import { useAuthSubmit } from "@/hooks/useAuthSubmit";
import { resendVerification, verifyEmail } from "@/lib/api/auth";
import type { Messages } from "@/lib/utils/messages";

/** The frame's countdown: "Resend email in 0:60secs". */
const RESEND_AFTER_S = 60;

/**
 * Confirm Your Email (`auth-flow/confirm email.png`), after Create Account or
 * a sign-in to an unconfirmed account. Since 2026-10-28 the email carries a
 * 6-digit code, entered here; the frame predates it, so the code field and
 * CONFIRM sit between its paragraphs and the resend countdown. FLAGGED.
 * Confirming signs the player in and moves on, as the old link did. RESEND
 * EMAIL is the frame's outlined, dimmed button while the countdown runs and
 * lights up when it ends; a resend starts the count again. Reached without
 * `?email` (an old link), it asks for the address too.
 */
export function ConfirmEmail({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.auth;
  const params = useSearchParams();
  const known = params.get("email");
  const { setUser } = useAuth();
  const { navigate } = usePageTransition();
  const confirm = useAuthSubmit();
  const resendCall = useAuthSubmit();
  const [email, setEmail] = useState(known ?? "");
  const [code, setCode] = useState(params.get("code") ?? "");
  const [left, setLeft] = useState(RESEND_AFTER_S);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await confirm.run(() => verifyEmail(email, code));
    if (!result.ok) return;
    // Confirmed on another device than the one that signed up: there is no session to open here.
    if (!result.value) return navigate(`/${locale}/sign-in?verified=1`);
    setUser(result.value);
    navigate(`/${locale}/the-game`);
  };

  const resend = async () => {
    if (!email.trim()) return;
    const result = await resendCall.run(() => resendVerification(email));
    if (!result.ok) return;
    toast(t.confirm.resent);
    setLeft(RESEND_AFTER_S);
  };

  const waiting = left > 0;

  return (
    <div className="mt-8 sm:mt-11">
      <div className="text-white/80 font-body text-body-sm space-y-5">
        <p>{t.confirm.sent.replace("{email}", known ?? t.confirm.yourEmail)}</p>
        <p>{t.confirm.help}</p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-6">
        {known ? null : (
          <AuthField
            label={t.fields.email}
            placeholder={t.placeholders.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        )}
        <AuthField
          label={t.fields.code}
          placeholder={t.placeholders.code}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
        />

        {confirm.error ? <AuthNotice tone="error">{errorLine(messages, confirm.error)}</AuthNotice> : null}

        <div className="flex justify-end">
          <AuthSubmit pending={confirm.pending}>{t.confirm.submit}</AuthSubmit>
        </div>
      </form>

      <p
        aria-live="polite"
        className={`text-white/80 font-body mt-10 text-body sm:mt-12 ${waiting ? "" : "invisible"}`}
      >
        {t.confirm.resendIn}{" "}
        <span className="text-flare">{t.confirm.seconds.replace("{time}", `0:${String(left).padStart(2, "0")}`)}</span>
      </p>

      {resendCall.error ? <AuthNotice tone="error">{errorLine(messages, resendCall.error)}</AuthNotice> : null}

      <div className="mt-9 flex justify-center pb-9">
        <button
          type="button"
          onClick={resend}
          disabled={waiting || resendCall.pending || !email.trim()}
          aria-busy={resendCall.pending}
          className="border-smoke text-white font-body hover:bg-coal focus-visible:outline-signal h-11 cursor-pointer border px-7 text-[1.125rem] font-medium transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-white/60 disabled:hover:bg-transparent"
        >
          {t.confirm.resend}
        </button>
      </div>
    </div>
  );
}
