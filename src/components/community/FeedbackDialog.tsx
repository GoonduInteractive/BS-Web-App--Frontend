"use client";

import { useId, useRef, useState } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { TornDialog } from "@/components/ui/TornDialog";
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
 * NOTHING IS SENT ANYWHERE. There is no backend; a submitted note is added to
 * this visitor's wall for the length of the visit and to nothing else - the
 * same line the checkout and the registration sheet hold. An empty submit
 * puts the focus back in the field rather than posting a blank note.
 */
export function FeedbackDialog({
  open,
  onClose,
  onSubmit,
  messages,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (body: string) => void;
  messages: Messages;
}) {
  const t = messages.community.form;
  const [body, setBody] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const fieldId = useId();

  const submit = () => {
    const text = body.trim();
    if (!text) {
      field.current?.focus();
      return;
    }
    onSubmit(text);
    setBody("");
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
        rows={7}
        className="border-ink text-ink placeholder:text-ink/60 font-body text-body focus-visible:outline-signal mt-8.5 block h-[13.375rem] w-full resize-none border bg-white px-3.75 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
      />

      <div className="mt-10 flex justify-center">
        <BracketButton tone="ink" field="light" onClick={submit} className="px-4.75 py-4.75 leading-none tracking-normal">
          {t.submit}
        </BracketButton>
      </div>
    </TornDialog>
  );
}
