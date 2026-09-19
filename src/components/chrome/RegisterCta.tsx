"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import type { Messages } from "@/lib/utils/messages";

/**
 * REGISTER, at the header's right where the account control sat (parked —
 * see `SiteHeader`). Per the human: "use the button component but without the
 * bracket" — so `BracketButton` with `brackets={false}`, at the utility links'
 * 14px. No frame draws this; FLAGGED.
 *
 * THE SHEET IS A LAZY CHUNK. The header is on every page, and the form brings
 * Axios and the dialog shell with it — none of which a visitor who never
 * clicks should download. `next/dynamic` with no server render mounts it on
 * the first click; a hover or focus on the button starts the fetch early, so
 * the sheet is there when the click lands. Closing unmounts it, which is also
 * how the form comes back empty next time.
 */
const load = () => import("@/components/chrome/RegisterDialog").then((m) => m.RegisterDialog);
const RegisterDialog = dynamic(load, { ssr: false });

export function RegisterCta({ messages, locale }: { messages: Messages; locale: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BracketButton
        brackets={false}
        onClick={() => setOpen(true)}
        onPointerEnter={() => void load()}
        onFocus={() => void load()}
        className="px-2.5 py-2 text-[0.8125rem] tracking-normal whitespace-nowrap md:px-4 md:py-2.5 md:text-[0.875rem]"
      >
        {messages.register.cta}
      </BracketButton>

      {open && <RegisterDialog messages={messages} locale={locale} onClose={() => setOpen(false)} />}
    </>
  );
}
