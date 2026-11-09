"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthNotice } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { AuthSubmit } from "@/components/auth/AuthSubmit";
import { errorLine } from "@/components/auth/errors";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { useAuthSubmit } from "@/hooks/useAuthSubmit";
import { requestPasswordReset } from "@/lib/api/auth";
import type { Messages } from "@/lib/utils/messages";

/**
 * Forgot Password (`auth-flow/Forgot password.png`). A send goes on to Reset
 * Password with the address (`?email=`), where the emailed 6-digit code and the
 * new password are entered; neither page says whether the address has an
 * account. `?email=` here too, from Reset Password's "Get a new code".
 */
export function ForgotPasswordForm({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.auth;
  const { navigate } = usePageTransition();
  const { pending, error, run } = useAuthSubmit();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = email.trim();
    const result = await run(() => requestPasswordReset(address));
    if (result.ok) navigate(`/${locale}/reset-password?email=${encodeURIComponent(address)}`);
  };

  return (
    <>
      <p className="text-white/80 font-body mx-auto mt-4 max-w-[19rem] text-center text-[0.75rem] leading-4">
        {t.forgot.body}
      </p>

      <form onSubmit={submit} className="mt-10 pb-10 sm:mt-12 sm:pb-20">
        <AuthField
          label={t.fields.email}
          placeholder={t.placeholders.email}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        {error ? <AuthNotice tone="error">{errorLine(messages, error)}</AuthNotice> : null}

        <div className="mt-4.5 flex justify-end">
          <AuthSubmit pending={pending}>{t.forgot.submit}</AuthSubmit>
        </div>
      </form>
    </>
  );
}
