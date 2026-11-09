"use client";

import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentPropsWithoutRef } from "react";

type InputProps = Omit<ComponentPropsWithoutRef<"input">, "id" | "className">;

const INPUT =
  "border-smoke text-white font-body placeholder:text-white/60 focus-visible:border-white/70 focus-visible:outline-signal h-12 w-full rounded-[0.1875rem] border bg-transparent px-4 text-[0.9375rem] focus-visible:outline-2 focus-visible:outline-offset-2";

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
 * A choice from a list, in the same box. Native, so the keyboard, screen
 * readers and the phone's own picker come free. No frame draws one: it follows
 * the fields above it. The placeholder is the empty first option, so
 * `required` holds until a real one is picked.
 */
export function AuthSelect({
  label,
  placeholder,
  options,
  ...select
}: { label: string; placeholder: string; options: readonly { value: string; label: string }[] } & Omit<
  ComponentPropsWithoutRef<"select">,
  "id" | "className" | "children"
>) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <select id={id} {...select} className={`${INPUT} cursor-pointer appearance-none pr-12 invalid:text-white/60`}>
          <option value="" disabled className="bg-pitch">
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-pitch text-white">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="text-white/70 pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" strokeWidth={1.75} />
      </div>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="text-white font-body mb-2 block text-[0.8125rem] leading-[1.2]">
      {children}
    </label>
  );
}
