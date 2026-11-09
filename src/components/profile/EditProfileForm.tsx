"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { PinGlyph } from "@/components/profile/ProfileGlyphs";
import { BracketButton } from "@/components/ui/BracketButton";
import { toast } from "@/components/ui/Toaster";
import { MY_PROFILE, useMyProfile } from "@/hooks/useMyProfile";
import { ApiError } from "@/lib/api/client";
import { updateMyProfile, uploadMyAvatar, type PlayerProfile } from "@/lib/api/player";
import type { SignUpRegion } from "@/lib/api/regions";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { isRemoteImage } from "@/lib/utils/remote-image";

/**
 * Edit profile. Figma: `context/design/12-player-profile/Edit profile.png`.
 *
 * The form starts from the player's profile (read in the browser, as the
 * profile page does) and `SAVE CHANGES` sends it to `PUT /v1/player/profile`;
 * `UPLOAD NEW AVATAR` picks a picture, uploads it and makes it the avatar.
 * Both refresh the profile and the header's account chip.
 *
 * LOCATION IS THE REGION LIST, not free text: the API stores a region (the
 * ones admins manage), the same list Create Account offers. It keeps the
 * frame's pin. FLAGGED: the frame draws a text field.
 */
export function EditProfileForm({
  regions,
  messages,
  locale,
}: {
  /** For Location: the regions a player can belong to. */
  regions: readonly SignUpRegion[];
  messages: Messages;
  locale: Locale;
}) {
  const mine = useMyProfile();
  const props = { regions, messages, locale };

  if (mine.data) return <ProfileForm initial={fromProfile(mine.data, regions)} {...props} />;
  if (mine.isError) {
    return (
      <p role="alert" className="text-menu-fg/85 font-body text-body mx-auto max-w-[56.5rem] py-24 text-center">
        {messages.auth.errors.unknown}
      </p>
    );
  }
  // The card's own height holds the page still while the profile loads.
  return <div aria-busy className="bg-pitch mx-auto min-h-[66rem] w-full max-w-[56.5rem] rounded-[1.25rem]" />;
}

type Initial = { avatar: string; firstName: string; lastName: string; username: string; regionId: string };

function fromProfile(p: PlayerProfile, regions: readonly SignUpRegion[]): Initial {
  return {
    avatar: p.avatar,
    firstName: p.firstName,
    lastName: p.lastName,
    // Shown with its @, as the placeholder and the profile card draw it.
    username: p.username ? `@${p.username}` : "",
    regionId: regions.find((r) => r.slug === p.regionSlug)?.id ?? "",
  };
}

/** What the form says when a save or an upload fails. */
function failure(error: unknown, messages: Messages, { conflict }: { conflict?: string } = {}): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return messages.auth.errors.network;
    if (conflict && (error.status === 409 || /taken|exists|already|in use/i.test(error.message))) return conflict;
  }
  return messages.auth.errors.unknown;
}

function ProfileForm({
  initial,
  regions,
  messages,
  locale,
}: {
  initial: Initial;
  regions: readonly SignUpRegion[];
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.profile;
  const f = t.form;
  const { user, setUser } = useAuth();
  const queries = useQueryClient();

  const save = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (_, changes) => {
      toast(f.saved);
      void queries.invalidateQueries({ queryKey: MY_PROFILE });
      if (!user) return;
      // The header's chip, without waiting for the next sign-in to read it.
      const username = changes.username.trim().replace(/^@/, "");
      setUser({
        ...user,
        firstName: changes.firstName.trim() || user.firstName,
        lastName: changes.lastName.trim() || user.lastName,
        handle: username ? `@${username}` : user.handle,
      });
    },
  });

  const upload = useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: (url) => {
      toast(f.avatarSaved);
      void queries.invalidateQueries({ queryKey: MY_PROFILE });
      if (user) setUser({ ...user, avatar: url });
    },
  });
  const picker = useRef<HTMLInputElement>(null);
  const avatar = upload.data ?? initial.avatar;

  const [fields, setFields] = useState({
    firstName: initial.firstName,
    lastName: initial.lastName,
    username: initial.username,
    regionId: initial.regionId,
  });
  const set = (key: keyof typeof fields) => (value: string) => {
    // A change after a save means the line under the button no longer holds.
    if (!save.isIdle) save.reset();
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!save.isPending) save.mutate(fields);
  };

  return (
    <div className="bg-pitch mx-auto w-full max-w-[56.5rem] rounded-[1.25rem] px-6 py-10 md:px-21.5 md:py-13.5">
      <Link
        href={`/${locale}/profile`}
        className="text-ink font-body focus-visible:outline-signal inline-flex h-8 items-center gap-2.5 bg-[url('/assets/ornaments/onu-uzo-chip.svg')] bg-size-[100%_100%] bg-center bg-no-repeat px-4 text-[0.75rem] leading-none tracking-[0.04em] focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {/* The delivered arrow points down; a quarter turn clockwise points left. */}
        <Image
          src="/assets/ornaments/arrow.svg"
          alt=""
          aria-hidden
          width={23}
          height={29}
          className="h-3 w-2.5 rotate-90 select-none"
        />
        {f.back}
      </Link>

      <div className="mt-9 flex flex-wrap items-center gap-8.5">
        <div className="border-signal relative size-23 shrink-0 overflow-hidden rounded-full border-2">
          <Image
            src={avatar}
            unoptimized={isRemoteImage(avatar)}
            alt={t.avatarAlt}
            fill
            priority
            sizes="92px"
            className="scale-[1.35] object-cover object-top select-none"
          />
        </div>

        <button
          type="button"
          onClick={() => picker.current?.click()}
          disabled={upload.isPending}
          aria-busy={upload.isPending || undefined}
          className="border-menu-fg/90 text-menu-fg font-body focus-visible:outline-signal h-11.5 cursor-pointer border px-5 text-[0.9375rem] leading-none transition-colors duration-150 ease-gate hover:bg-menu-fg/10 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60"
        >
          {f.uploadAvatar}
        </button>
        <input
          ref={picker}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            // Cleared, so picking the same file again still uploads it.
            event.target.value = "";
            if (file) upload.mutate(file);
          }}
        />
      </div>
      <Status error={upload.isError ? failure(upload.error, messages) : undefined} className="mt-4" />

      <form className="mt-10.5" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          <Field
            label={f.firstName}
            placeholder={f.firstNamePlaceholder}
            value={fields.firstName}
            onChange={set("firstName")}
            autoComplete="given-name"
          />
          <Field
            label={f.lastName}
            placeholder={f.lastNamePlaceholder}
            value={fields.lastName}
            onChange={set("lastName")}
            autoComplete="family-name"
          />
        </div>

        <div className="mt-6">
          <Field
            label={f.username}
            placeholder={f.usernamePlaceholder}
            value={fields.username}
            onChange={set("username")}
            autoComplete="username"
            // The API's rule for a handle: 2 to 32 letters, digits, _ . or -, the @ optional.
            pattern="@?[a-zA-Z0-9_.\-]{2,32}"
            maxLength={33}
          />
        </div>

        <div className="mt-6">
          <SelectField
            label={f.locationLabel}
            placeholder={messages.auth.placeholders.region}
            // As the profile card prints a location: "Enugu, Nigeria", but plain "Global".
            options={regions.map((r) => ({ value: r.id, label: r.slug === "global" ? r.name : `${r.name}, Nigeria` }))}
            value={fields.regionId}
            onChange={set("regionId")}
            trailing={<PinGlyph />}
          />
        </div>

        <div className="mt-11 flex flex-col items-center">
          <BracketButton
            type="submit"
            disabled={save.isPending}
            aria-busy={save.isPending || undefined}
            className="px-5 py-[1.15rem] tracking-normal"
          >
            {f.save}
          </BracketButton>
          <Status
            error={save.isError ? failure(save.error, messages, { conflict: f.usernameTaken }) : undefined}
            className="mt-5 text-center"
          />
        </div>
      </form>
    </div>
  );
}

/**
 * The line under an action when it failed - beside what to fix. (That it
 * worked is a toast.) Always in the page, so a screen reader hears it change;
 * empty, it takes no room (its spacing, `className`, applies only with
 * something to say).
 */
function Status({ error, className }: { error?: string; className?: string }) {
  return (
    <p role="alert" className={cn("text-signal font-body text-body-sm leading-snug", error && className)}>
      {error}
    </p>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  trailing,
  inputMode,
  autoComplete,
  pattern,
  maxLength,
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
  /** Checked by the browser on submit, in its own words. */
  pattern?: string;
  maxLength?: number;
  /** Shown under the field, which turns its border red. */
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-menu-fg/85 font-body text-body-sm leading-none">{label}</span>
      <span className="relative mt-2.5 block">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          pattern={pattern}
          maxLength={maxLength}
          aria-invalid={!!error}
          onChange={(event) => onChange(event.target.value)}
          className="border-menu-fg/25 text-menu-fg placeholder:text-menu-fg/45 font-body text-body focus-visible:outline-signal aria-invalid:border-signal h-12.5 w-full rounded-md border bg-transparent px-4 leading-none focus-visible:outline-2 focus-visible:-outline-offset-1"
        />
        {trailing ? (
          <span
            aria-hidden
            className="text-menu-fg/60 pointer-events-none absolute inset-y-0 right-4 grid place-items-center"
          >
            {trailing}
          </span>
        ) : null}
      </span>
      {error ? <span className="text-signal font-body text-body-sm mt-2 block leading-none">{error}</span> : null}
    </label>
  );
}

/**
 * The form's field, as a select: same border, radius and height, with a caret
 * (or `trailing` in its place). Unchosen, it reads in the placeholder's grey.
 * Not `required`: an unchosen region mustn't stop the profile saving.
 */
function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  trailing,
}: {
  label: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-menu-fg/85 font-body text-body-sm leading-none">{label}</span>
      <span className="relative mt-2.5 block">
        <select
          value={value}
          data-empty={value === "" || undefined}
          onChange={(event) => onChange(event.target.value)}
          className="border-menu-fg/25 text-menu-fg font-body text-body focus-visible:outline-signal data-empty:text-menu-fg/45 h-12.5 w-full appearance-none rounded-md border bg-transparent px-4 pr-11 leading-none focus-visible:outline-2 focus-visible:-outline-offset-1 [&>option]:bg-ash [&>option]:text-menu-fg"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {trailing ? (
          <span aria-hidden className="text-menu-fg/60 pointer-events-none absolute inset-y-0 right-4 grid place-items-center">
            {trailing}
          </span>
        ) : (
          <svg aria-hidden viewBox="0 0 12 8" className="text-menu-fg/60 pointer-events-none absolute top-1/2 right-4 h-2 w-3 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M1 1.5L6 6.5L11 1.5" />
          </svg>
        )}
      </span>
    </label>
  );
}
