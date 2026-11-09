"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AuthNotice, AuthSwitch } from "@/components/auth/AuthCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { AuthSubmit } from "@/components/auth/AuthSubmit";
import { errorLine } from "@/components/auth/errors";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { toast } from "@/components/ui/Toaster";
import { useAuthSubmit } from "@/hooks/useAuthSubmit";
import { useRedirectIfSignedIn } from "@/hooks/useRedirectIfSignedIn";
import { signIn } from "@/lib/api/auth";
import { afterAuthHref, authHref } from "@/lib/utils/auth-links";
import type { Messages } from "@/lib/utils/messages";

/**
 * Sign In (`auth-flow/Login page.png`). An unconfirmed account goes to Confirm
 * Email rather than being told off; `?reset=1` is the arrival from Reset
 * Password and says so in a toast; `?verified=1` is a confirmed email opened
 * on another device, which has no session to sign in with, and says so too.
 */
export function SignInForm({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.auth;
  const params = useSearchParams();
  const next = params.get("next");
  const { setUser } = useAuth();
  const { navigate } = usePageTransition();
  const { pending, error, run } = useAuthSubmit();
  const [form, setForm] = useState({ email: "", password: "" });
  useRedirectIfSignedIn(locale, next);

  // Once per arrival: React runs effects twice in development, and the ref outlives that.
  const arrived = useRef(false);
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    if (params.get("reset") === "1") toast(t.signIn.resetDone);
    if (params.get("verified") === "1") toast(t.signIn.verifiedDone);
  }, [params, t]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await run(() => signIn(form));
    if (result.ok) {
      setUser(result.value);
      navigate(afterAuthHref(locale, next));
    } else if (result.reason === "unverified") {
      navigate(`/${locale}/confirm-email?email=${encodeURIComponent(form.email.trim())}`);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="mt-8 space-y-6">
        <AuthField
          label={t.fields.email}
          placeholder={t.placeholders.email}
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          autoComplete="email"
          required
        />
        <PasswordField
          label={t.fields.password}
          placeholder={t.placeholders.password}
          showLabel={t.showPassword}
          hideLabel={t.hidePassword}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          autoComplete="current-password"
          required
        />

        {error && error !== "unverified" ? (
          <AuthNotice tone="error">{errorLine(messages, error)}</AuthNotice>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/${locale}/forgot-password`}
            className="text-white font-body focus-visible:outline-signal mt-1 text-[0.9375rem] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t.signIn.forgot}
          </Link>
          <AuthSubmit pending={pending}>{t.signIn.submit}</AuthSubmit>
        </div>
      </form>

      <AuthSwitch
        prompt={t.signIn.switchPrompt}
        link={t.signIn.switchLink}
        href={authHref(locale, "sign-up", next)}
      />
    </>
  );
}
