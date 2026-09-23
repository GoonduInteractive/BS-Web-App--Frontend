"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { PinGlyph } from "@/components/profile/ProfileGlyphs";
import { BracketButton } from "@/components/ui/BracketButton";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Profile } from "@/types/profile";

/**
 * Edit profile. Figma: `context/design/12-player-profile/Edit profile.png`.
 *
 * ⚠ NOTHING TYPED HERE IS STORED OR SENT. Values live in component state for the
 * length of the visit - not `localStorage`, not a request. There is no backend
 * to receive a person's name and location, and no consent flow to collect them
 * under. `SAVE CHANGES` saves nothing, and that is deliberate rather than
 * unfinished: the alternative is a form that quietly banks personal details in a
 * browser with no way to remove them.
 *
 * The same reasoning as the checkout's shipping form, which is the other screen
 * on this site that asks for personal data.
 *
 * FLAGGED: `UPLOAD NEW AVATAR` has no handler. An upload needs somewhere to
 * upload to.
 */
export function EditProfileForm({
  profile,
  messages,
  locale,
}: {
  profile: Profile;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.profile;
  const f = t.form;

  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    username: "",
    location: "",
  });
  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

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
            src={profile.avatar}
            alt={t.avatarAlt}
            fill
            priority
            sizes="92px"
            className="scale-[1.35] object-cover object-top select-none"
          />
        </div>

        <button
          type="button"
          className="border-menu-fg/90 text-menu-fg font-body focus-visible:outline-signal h-11.5 cursor-pointer border px-5 text-[0.9375rem] leading-none transition-colors duration-150 ease-gate hover:bg-menu-fg/10 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {f.uploadAvatar}
        </button>
      </div>

      {/* No action and no method: there is nowhere to submit to. */}
      <form className="mt-10.5" onSubmit={(event) => event.preventDefault()}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          <Field
            label={f.firstName}
            placeholder={f.firstNamePlaceholder}
            value={fields.firstName}
            onChange={set("firstName")}
          />
          <Field
            label={f.lastName}
            placeholder={f.lastNamePlaceholder}
            value={fields.lastName}
            onChange={set("lastName")}
          />
        </div>

        <div className="mt-6">
          <Field
            label={f.username}
            placeholder={f.usernamePlaceholder}
            value={fields.username}
            onChange={set("username")}
          />
        </div>

        <div className="mt-6">
          <Field
            label={f.locationLabel}
            placeholder={f.locationPlaceholder}
            value={fields.location}
            onChange={set("location")}
            trailing={<PinGlyph />}
          />
        </div>

        <div className="mt-11 flex justify-center">
          <BracketButton type="submit" className="px-5 py-[1.15rem] tracking-normal">
            {f.save}
          </BracketButton>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  trailing,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-menu-fg/85 font-body text-body-sm leading-none">{label}</span>
      <span className="relative mt-2.5 block">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="border-menu-fg/25 text-menu-fg placeholder:text-menu-fg/45 font-body text-body focus-visible:outline-signal h-12.5 w-full rounded-md border bg-transparent px-4 leading-none focus-visible:outline-2 focus-visible:-outline-offset-1"
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
    </label>
  );
}
