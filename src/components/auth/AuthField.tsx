"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentPropsWithoutRef } from "react";

import { Dropdown } from "@/components/ui/Dropdown";

type InputProps = Omit<ComponentPropsWithoutRef<"input">, "id" | "className">;

// A box given rather than asked (an invite's referral code and region) sits on the coal fill. The attribute, not
// `:read-only`, which a <select> also matches.
const INPUT =
  "border-smoke text-white font-body placeholder:text-white/60 focus-visible:border-white/70 focus-visible:outline-signal [&[readonly]]:bg-coal [&[readonly]]:text-white/80 [&[readonly]]:cursor-default h-12 w-full rounded-[0.1875rem] border bg-transparent px-4 text-[0.9375rem] focus-visible:outline-2 focus-visible:outline-offset-2";

/** Label over a smoke-bordered box, as every auth frame draws its fields. */
export function AuthField({ label, ...input }: { label: string } & InputProps) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} type="text" {...input} className={INPUT} />
    </div>
  );
}

/** The same field with the frame's eye at its right, which shows the password. */
export function PasswordField({
  label,
  showLabel,
  hideLabel,
  ...input
}: { label: string; showLabel: string; hideLabel: string } & Omit<InputProps, "type">) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const Glyph = shown ? EyeOff : Eye;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <input id={id} type={shown ? "text" : "password"} {...input} className={`${INPUT} pr-12`} />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? hideLabel : showLabel}
          aria-pressed={shown}
          className="text-white/70 hover:text-white focus-visible:outline-signal absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center focus-visible:outline-2 focus-visible:-outline-offset-2"
        >
          <Glyph aria-hidden className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

/**
 * A choice from a list, in the same box: the site's dropdown (`ui/Dropdown`;
 * the human, 2026-11-23: no browser selects) in this field's border and
 * height. No frame draws one: it follows the fields above it. `required`
 * holds until a real choice is made. `onChange` hands back
 * `{ target: { value } }` as the native one did, so the forms' setters work unchanged.
 */
export function AuthSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  required,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} id={`${id}-label`}>
        {label}
      </Label>
      <Dropdown
        id={id}
        labelledBy={`${id}-label`}
        options={options}
        value={value}
        onChange={(next) => onChange({ target: { value: next } })}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        triggerClassName={INPUT}
        placeholderClassName="text-white/60"
      />
    </div>
  );
}

function Label({ htmlFor, id, children }: { htmlFor: string; id?: string; children: string }) {
  return (
    <label htmlFor={htmlFor} id={id} className="text-white font-body mb-2 block text-[0.8125rem] leading-[1.2]">
      {children}
    </label>
  );
}
