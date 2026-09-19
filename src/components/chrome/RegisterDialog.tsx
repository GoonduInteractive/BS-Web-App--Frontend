"use client";

import { usePathname } from "next/navigation";
import { useId, useState, type ChangeEvent, type ComponentPropsWithoutRef, type FormEvent } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { TornDialog } from "@/components/ui/TornDialog";
import { submitRegistration } from "@/lib/api/register";
import type { Messages } from "@/lib/utils/messages";

/**
 * The sign-up sheet behind the header's REGISTER: first name, last name,
 * WhatsApp number and email, sent to a Google Sheet through
 * `lib/api/register.ts`. Per the human: "use modal bg used in tournament
 * register" — so the JOIN TOURNAMENT sheet: the same `TornDialog`, width,
 * padding and title, the checkout form's field shape turned for the light
 * ground (labels in the facts' slate, a hairline box in ash), SUBMIT as
 * CONFIRM REGISTRATION is drawn, and REGISTRATION SUCCESSFUL's disc and title
 * when it lands. No frame draws this; FLAGGED.
 *
 * TWO OUTCOMES, per the human ("show another thing that tells the user that
 * has already successfully registered ... that they have submitted before and
 * we have their data"). The script answers `duplicate: true` for an email it
 * already holds, and that opens ALREADY REGISTERED — the same sheet with the
 * address named, on a gild disc rather than the red one, so the two read as
 * different things at a glance. The title and description ("JOIN THE
 * COMMUNITY" ...) and both outcomes' copy are ours at the human's request;
 * FLAGGED for Goondu to confirm.
 *
 * VALIDATION IS THE BROWSER'S. `required`, `type="email"` and a pattern on the
 * number, so the messages a visitor sees for an empty or malformed field are
 * their browser's own, in its language — no error copy is invented for them.
 * The number field lets through digits, spaces and a leading `+` only, so
 * "0803-000-0000" becomes "0803 000 0000" as it is typed rather than failing
 * the pattern for its dashes. The one line of ours is for a send that fails.
 *
 * NO HONEYPOT, AND THAT IS A CORRECTION (2026-09-19). The first cut had a hidden
 * text field that, when filled, made the sheet say thank you and send nothing —
 * the classic bot trap. Browser autofill fills hidden fields too: the human
 * autofilled their details, the trap fired, REGISTRATION SUCCESSFUL showed, and
 * no request ever left the page. A guard that silently loses real sign-ups is
 * worse than the spam it stops, so every success here now follows a real
 * `{ ok: true }` from the script, and the script's own checks (required fields,
 * an email and a number that look like one, the duplicate check) are the guard.
 */
export function RegisterDialog({
  messages,
  locale,
  onClose,
}: {
  messages: Messages;
  locale: string;
  onClose: () => void;
}) {
  const t = messages.register;
  const pathname = usePathname();
  const [form, setForm] = useState({ firstName: "", lastName: "", whatsapp: "", email: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done" | "again">("idle");
  const errorId = useId();

  const set = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const value = field === "whatsapp" ? raw.replace(/[^\d\s+]/g, "").replace(/(?!^)\+/g, "") : raw;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    try {
      const result = await submitRegistration({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        whatsapp: form.whatsapp.replace(/\s+/g, ""),
        email: form.email.trim(),
        locale,
        page: pathname,
      });
      setStatus(result.duplicate ? "again" : "done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return <Outcome copy={t.done} closeLabel={t.close} disc="signal" onClose={onClose} />;
  }
  if (status === "again") {
    return (
      <Outcome
        copy={{ ...t.again, body: t.again.body.replace("{email}", form.email.trim()) }}
        closeLabel={t.close}
        disc="gild"
        onClose={onClose}
      />
    );
  }

  return (
    <TornDialog
      open
      onClose={onClose}
      label={t.label}
      closeLabel={t.close}
      maxWidthClassName="max-w-[62.75rem]"
      className="px-6 pt-16 pb-14 sm:px-21 sm:pt-18.75 sm:pb-22"
    >
      <h2 className="font-display text-ink text-section-heading font-semibold tracking-[-0.058em] uppercase">
        {t.title}
      </h2>
      <p className="text-ash font-body text-body mt-1 max-w-115">{t.body}</p>

      <form onSubmit={submit} aria-describedby={status === "error" ? errorId : undefined} className="mt-8">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field
            label={t.fields.firstName}
            value={form.firstName}
            onChange={set("firstName")}
            autoComplete="given-name"
            required
          />
          <Field
            label={t.fields.lastName}
            value={form.lastName}
            onChange={set("lastName")}
            autoComplete="family-name"
            required
          />
          <Field
            label={t.fields.whatsapp}
            value={form.whatsapp}
            onChange={set("whatsapp")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            pattern="[+]?[0-9 ]{7,20}"
            required
          />
          <Field
            label={t.fields.email}
            value={form.email}
            onChange={set("email")}
            type="email"
            autoComplete="email"
            required
          />
        </div>

        {status === "error" && (
          <p id={errorId} role="alert" className="text-scar font-body text-body-sm mt-6">
            {t.error}
          </p>
        )}

        <div className="mt-10">
          <BracketButton
            type="submit"
            tone="ink"
            field="light"
            disabled={status === "sending"}
            aria-busy={status === "sending"}
            className="px-4 py-4.75 leading-none tracking-normal whitespace-nowrap"
          >
            {t.submit}
          </BracketButton>
        </div>
      </form>
    </TornDialog>
  );
}

/**
 * What the sheet ends on: REGISTRATION SUCCESSFUL's disc, title and line —
 * the red disc with a white tick for a new registration, a gild one with an
 * ink tick for an address already on the list.
 */
function Outcome({
  copy,
  closeLabel,
  disc,
  onClose,
}: {
  copy: { label: string; title: string; body: string };
  closeLabel: string;
  disc: "signal" | "gild";
  onClose: () => void;
}) {
  return (
    <TornDialog
      open
      onClose={onClose}
      label={copy.label}
      closeLabel={closeLabel}
      maxWidthClassName="max-w-[43.6875rem]"
      className="flex flex-col items-center px-6 pt-16.75 pb-16 text-center"
    >
      {/* 124 square — REGISTRATION SUCCESSFUL's disc. */}
      <span
        aria-hidden
        className={
          disc === "signal"
            ? "bg-signal text-menu-fg grid size-31 shrink-0 place-items-center rounded-full"
            : "bg-gild text-ink grid size-31 shrink-0 place-items-center rounded-full"
        }
      >
        <svg
          viewBox="0 0 44 34"
          className="w-11"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 18l12 12L40 5" />
        </svg>
      </span>
      <h2 className="font-display text-ink mt-4 text-[2.9375rem] leading-none font-semibold tracking-[-0.04em] uppercase">
        {copy.title}
      </h2>
      <p className="text-ash font-body text-body mt-2.5 max-w-120">{copy.body}</p>
    </TornDialog>
  );
}

/** Label over a hairline box — the checkout's field, on the white sheet. */
function Field({
  label,
  ...input
}: { label: string } & Omit<ComponentPropsWithoutRef<"input">, "id" | "className">) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-slate font-body text-body-sm block leading-none">
        {label}
      </label>
      <input
        id={id}
        type="text"
        {...input}
        className="border-ash/40 text-ash font-body text-body focus-visible:border-ash focus-visible:outline-signal mt-3 h-12 w-full border bg-transparent px-4.5 focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </div>
  );
}
