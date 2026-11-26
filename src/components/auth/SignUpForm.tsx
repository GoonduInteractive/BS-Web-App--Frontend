"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type ReactNode, type Ref } from "react";

import { AuthNotice, AuthSwitch } from "@/components/auth/AuthCard";
import { AuthField, AuthSelect, PasswordField } from "@/components/auth/AuthField";
import { AuthSubmit } from "@/components/auth/AuthSubmit";
import { errorLine } from "@/components/auth/errors";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { useAuthSubmit } from "@/hooks/useAuthSubmit";
import { useRedirectIfSignedIn } from "@/hooks/useRedirectIfSignedIn";
import { signUp } from "@/lib/api/auth";
import type { SignUpRegion } from "@/lib/api/regions";
import { authHref } from "@/lib/utils/auth-links";
import { readInviteRegion, readReferral } from "@/lib/utils/invite";
import type { Messages } from "@/lib/utils/messages";

/** Minimum password length until the backend states its own rule. FLAGGED. */
export const PASSWORD_MIN = 8;

/**
 * Create Account (`auth-flow/Create Account.png`). Empty and malformed fields
 * get the browser's own messages, in its language, as the old JOIN sheet did.
 * A new account is unconfirmed, so success goes to Confirm Email.
 *
 * TWO BOXES IN PLACE OF THE FRAME'S CONSENT PARAGRAPH (human, 2026-10-03). The
 * frame says joining is agreeing; the team wants it explicit, because the store
 * takes payments and has returns rules. So: the Terms of Use and Privacy Policy
 * box is required (the browser's own message if it is left empty), and the
 * marketing email box is its own choice and starts unticked, since consent to
 * marketing cannot be assumed. Both links open in a new tab so the form is not
 * lost. FLAGGED: no frame draws the boxes.
 *
 * REGION IS THE API'S, NOT THE FRAME'S (2026-10-23): `/v1/auth/create`
 * requires it. It sits under the email, drawn like the fields around it; the
 * regions are the ones admins manage. FLAGGED: no frame.
 *
 * FROM AN INVITE (`lib/utils/invite.ts`, 2026-11-19): `?ref=` is the inviting
 * player's referral code and `?region=` the region they're bringing friends
 * to. The code shows FIXED, a read-only Referral Code, and goes with the
 * account as `referral_code`. The region STARTS on the invite's and stays a
 * choice (the team, 2026-11-23: a friend may live elsewhere). A code that
 * isn't a username, or a region that isn't offered, is ignored and the form
 * is the ordinary one.
 */
export function SignUpForm({ messages, locale, regions }: { messages: Messages; locale: string; regions: readonly SignUpRegion[] }) {
  const t = messages.auth;
  const params = useSearchParams();
  const next = params.get("next");
  const referral = readReferral(params.get("ref"));
  const { navigate } = usePageTransition();
  const { pending, error, run } = useAuthSubmit();
  // The invite's region is where the picker starts; the player can change it.
  const [form, setForm] = useState(() => ({
    firstName: "",
    lastName: "",
    email: "",
    regionId: readInviteRegion(params.get("region"), regions)?.id ?? "",
    password: "",
  }));
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const terms = useRef<HTMLInputElement>(null);
  const strengthId = useId();
  useRedirectIfSignedIn(locale, next);

  const set = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await run(() =>
      signUp({
        ...form,
        ...(referral && { referralCode: referral }),
        termsAcceptedAt: new Date().toISOString(),
        marketingOptIn,
      }),
    );
    if (result.ok) navigate(`/${locale}/confirm-email?email=${encodeURIComponent(form.email.trim())}`);
  };

  return (
    <>
      <form onSubmit={submit} className="mt-6 sm:mt-4">
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <AuthField
            label={t.fields.firstName}
            placeholder={t.placeholders.firstName}
            value={form.firstName}
            onChange={set("firstName")}
            autoComplete="given-name"
            required
          />
          <AuthField
            label={t.fields.lastName}
            placeholder={t.placeholders.lastName}
            value={form.lastName}
            onChange={set("lastName")}
            autoComplete="family-name"
            required
          />
          <div className="sm:col-span-2">
            <AuthField
              label={t.fields.email}
              placeholder={t.placeholders.email}
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
            />
          </div>
          <AuthSelect
            label={t.fields.region}
            placeholder={t.placeholders.region}
            options={regions.map((r) => ({ value: r.id, label: r.name }))}
            value={form.regionId}
            onChange={set("regionId")}
            required
          />
          {referral ? <AuthField label={t.fields.referral} value={referral} readOnly aria-readonly /> : null}
          <div className="sm:col-span-2">
            <PasswordField
              label={t.fields.password}
              placeholder={t.placeholders.password}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
              minLength={PASSWORD_MIN}
              aria-describedby={strengthId}
              required
            />
            <PasswordStrength id={strengthId} password={form.password} minLength={PASSWORD_MIN} messages={messages} />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Checkbox ref={terms} required>
            <TermsLine messages={messages} locale={locale} />
          </Checkbox>
          <Checkbox checked={marketingOptIn} onChange={setMarketingOptIn}>
            {t.signUp.marketingConsent}
          </Checkbox>
        </div>

        {error ? <AuthNotice tone="error">{errorLine(messages, error)}</AuthNotice> : null}

        <div className="mt-7 flex justify-center">
          <AuthSubmit pending={pending}>{t.signUp.submit}</AuthSubmit>
        </div>
      </form>

      <AuthSwitch
        prompt={t.signUp.switchPrompt}
        link={t.signUp.switchLink}
        href={authHref(locale, "sign-in", next)}
        tight
      />
    </>
  );
}

/** A ticked box and its line. Native, so required-ness and keyboard come free. */
function Checkbox({
  ref,
  required,
  checked,
  onChange,
  children,
}: {
  ref?: Ref<HTMLInputElement>;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="text-white/80 font-body flex cursor-pointer items-start gap-3 text-[0.75rem] leading-4">
      <input
        ref={ref}
        type="checkbox"
        required={required}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="accent-signal focus-visible:outline-signal mt-px size-4 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <span>{children}</span>
    </label>
  );
}

/** The terms line, with Terms of Use and Privacy Policy as red links to their pages. */
function TermsLine({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.auth.signUp;
  const links = {
    "{terms}": { href: `/${locale}/terms`, label: t.terms },
    "{privacy}": { href: `/${locale}/privacy`, label: t.privacy },
  };

  return t.termsConsent.split(/({terms}|{privacy})/).map((part, i) => {
    const link = part === "{terms}" || part === "{privacy}" ? links[part] : null;
    if (!link) return part;
    return (
      <Link
        key={i}
        href={link.href}
        target="_blank"
        rel="noopener"
        className="text-signal focus-visible:outline-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {link.label}
      </Link>
    );
  });
}
