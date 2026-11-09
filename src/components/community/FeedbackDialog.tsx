"use client";

import { useId, useRef, useState } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { TornDialog } from "@/components/ui/TornDialog";
import { NOTE_MAX, NOTE_MIN } from "@/lib/api/notes";
import type { Messages } from "@/lib/utils/messages";

/**
 * DROP YOUR FEEDBACK - the sheet SHARE YOUR THOUGHTS opens. Figma:
 * `05-community/Community wall form.png`, an 844 x 618 sheet.
 *
 * WHAT THE FRAME MEASURES, sheet-relative:
 *
 *   title    centred, cap 48 at 80 → --text-section-heading, ink
 *   sub      centred 16px at 152, --color-ash
 *   field    163..680 x 203..417 - 517 x 214, a 1px ink rule, white; the
 *            placeholder "Input text" 15 in and 28 down
 *   SUBMIT   ink 374..469 x 457..513, the red brackets at 350 and 490
 *   close    752..774 x 62..82 - the shell's
 *
 * WHERE IT GOES is the board's business (`CommunityBoard`): the API, as the
 * signed-in player. The sheet keeps the text until the board says it landed, and shows the board's
 * error under SUBMIT when it didn't. A note shorter than the API's three
 * characters puts the focus back in the field rather than sending; the field
 * stops at its 140.
 */
export function FeedbackDialog({
  open,
  onClose,
  onSubmit,
  busy = false,
  error = null,
  messages,
}: {
  open: boolean;
  onClose: () => void;
  /** Resolves true once the note is posted; false keeps the text for another try. */
  onSubmit: (body: string) => boolean | Promise<boolean>;
  busy?: boolean;
  /** Why the last submit failed, under the button. */
  error?: string | null;
  messages: Messages;
}) {
  const t = messages.community.form;
  const [body, setBody] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const fieldId = useId();

  const submit = async () => {
    const text = body.trim();
    if (text.length < NOTE_MIN) {
      field.current?.focus();
      return;
    }
    if (busy) return;
    if (await onSubmit(text)) setBody("");
  };

  return (
    <TornDialog
      open={open}
      onClose={onClose}
      label={t.label}
      closeLabel={t.close}
      maxWidthClassName="max-w-[52.75rem]"
      className="px-6 pt-16 pb-14 text-center sm:px-40.75 sm:pt-[4.5625rem] sm:pb-26.25"
    >
      <h2 className="font-display text-ink text-section-heading font-semibold tracking-[-0.058em] uppercase">
        {t.title}
      </h2>
      <p className="text-ash font-body text-body mt-2.75">{t.sub}</p>

      <label htmlFor={fieldId} className="sr-only">
        {t.field}
      </label>
      <textarea
        ref={field}
        id={fieldId}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={t.placeholder}
        maxLength={NOTE_MAX}
        rows={7}
        className="border-ink text-ink placeholder:text-ink/60 font-body text-body focus-visible:outline-signal mt-8.5 block h-[13.375rem] w-full resize-none border bg-white px-3.75 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
      />

      <div className="mt-10 flex justify-center">
        <BracketButton
          tone="ink"
          field="light"
          onClick={submit}
          disabled={busy}
          aria-busy={busy || undefined}
          className="px-4.75 py-4.75 leading-none tracking-normal"
        >
          {t.submit}
        </BracketButton>
      </div>
      {/* Always in the sheet, so a screen reader hears it; empty, it takes no room. */}
      <p role="alert" className={`text-signal font-body text-body-sm leading-snug ${error ? "mt-4" : ""}`}>
        {error}
      </p>
    </TornDialog>
  );
}
