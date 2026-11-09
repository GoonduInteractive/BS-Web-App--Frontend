"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { AuthNotice, AuthSwitch } from "@/components/auth/AuthCard";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { AuthSubmit } from "@/components/auth/AuthSubmit";
import { errorLine } from "@/components/auth/errors";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { PASSWORD_MIN } from "@/components/auth/SignUpForm";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { useAuthSubmit } from "@/hooks/useAuthSubmit";
import { resetPassword } from "@/lib/api/auth";
import type { Messages } from "@/lib/utils/messages";

/**
 * Reset Password (`auth-flow/Reset password.png`), reached from Forgot
 * Password with `?email=`. Since 2026-10-28 the email carries a 6-digit code
 * rather than a link, so the code is entered here above the new password; the
 * frame predates it. FLAGGED. Without `?email` it asks for the address too.
 * Success goes to Sign In with `?reset=1`. A wrong or spent code says so, with
 * the way to a new one.
 */
export function ResetPasswordForm({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.auth;
  const params = useSearchParams();
  const known = params.get("email");
  const { navigate } = usePageTransition();
  const { pending, error, run } = useAuthSubmit();
  const [form, setForm] = useState({ email: known ?? "", code: params.get("code") ?? "", password: "", confirm: "" });
  const [mismatch, setMismatch] = useState(false);
  const strengthId = useId();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    const result = await run(() => resetPassword(form.email, form.code, form.password));
    if (result.ok) navigate(`/${locale}/sign-in?reset=1`);
  };

  return (
    <>
      {known ? (
        <p className="text-white/80 font-body mx-auto mt-4 max-w-[19rem] text-center text-[0.75rem] leading-4">
          {t.reset.sent.replace("{email}", known)}
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-8 space-y-6">
        {known ? null : (
          <AuthField
            label={t.fields.email}
            placeholder={t.placeholders.email}
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="email"
            required
          />
        )}
        <AuthField
          label={t.fields.code}
          placeholder={t.placeholders.code}
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
        />
        <div>
          <PasswordField
            label={t.fields.newPassword}
            placeholder={t.placeholders.password}
            showLabel={t.showPassword}
            hideLabel={t.hidePassword}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="new-password"
            minLength={PASSWORD_MIN}
            aria-describedby={strengthId}
            required
          />
          <PasswordStrength id={strengthId} password={form.password} minLength={PASSWORD_MIN} messages={messages} />
        </div>
        <PasswordField
          label={t.fields.confirmPassword}
          placeholder={t.placeholders.password}
          showLabel={t.showPassword}
          hideLabel={t.hidePassword}
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          required
        />

        {mismatch ? <AuthNotice tone="error">{t.reset.mismatch}</AuthNotice> : null}
        {error === "invalid-code" ? (
          <AuthNotice tone="error">
            {t.errors["invalid-code"]}{" "}
            <Link
              href={`/${locale}/forgot-password${form.email.trim() ? `?email=${encodeURIComponent(form.email.trim())}` : ""}`}
              className="text-white underline underline-offset-2"
            >
              {t.reset.newCode}
            </Link>
          </AuthNotice>
        ) : error ? (
          <AuthNotice tone="error">{errorLine(messages, error)}</AuthNotice>
        ) : null}

        <div className="flex justify-end">
          <AuthSubmit pending={pending}>{t.reset.submit}</AuthSubmit>
        </div>
      </form>

      <AuthSwitch prompt={t.signIn.switchPrompt} link={t.signIn.switchLink} href={`/${locale}/sign-up`} />
    </>
  );
}
