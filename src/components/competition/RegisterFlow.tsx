"use client";

import { useCallback, useRef, useState } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { TornDialog } from "@/components/ui/TornDialog";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { formatPrice } from "@/lib/utils/price";
import type { Tournament } from "@/types/tournament";

export function RegisterFlow({
  tournament,
  messages,
  locale,
  profileHref,
  label,
  tone = "ink",
  field = "light",
}: {
  tournament: Tournament;
  messages: Messages;
  locale: Locale;
  profileHref: string;
  /**
   * The trigger's label and dressing. The featured card's is REGISTER NOW on a
   * black fill with red brackets on the linen; the tournament page's hero is
   * REGISTER FOR TOURNAMENT in signal with white brackets on the dark ground.
   * Defaults are the card's.
   */
  label?: string;
  tone?: "ink" | "signal";
  field?: "light" | "dark";
}) {
  const t = messages.competition;
  const [step, setStep] = useState<"closed" | "form" | "done">("closed");
  const [rules, setRules] = useState(false);
  const [available, setAvailable] = useState(false);
  const rulesBox = useRef<HTMLInputElement>(null);
  const availableBox = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setStep("closed");
    setRules(false);
    setAvailable(false);
  }, []);

  const confirm = () => {
    if (!rules) return rulesBox.current?.focus();
    if (!available) return availableBox.current?.focus();
    setStep("done");
  };

  const copy: { name: string } = t.tournaments[tournament.copyKey as keyof typeof t.tournaments];
  const deadline = tournament.closesAt
    ? new Intl.DateTimeFormat(locale === "ig" ? "ig" : "en-US", { month: "short", day: "numeric" }).format(
        new Date(tournament.closesAt),
      )
    : "";
  const prize = tournament.prizePool === undefined ? "" : formatPrice(tournament.prizePool, locale, messages.merch.price);
  const slots = tournament.slots
    ? t.register.slotsValue
        .replace("{taken}", String(tournament.slots.taken))
        .replace("{total}", String(tournament.slots.total))
    : "";

  return (
    <>
      <BracketButton
        tone={tone}
        field={field}
        onClick={() => setStep("form")}
        className="px-4 py-4.75 leading-none tracking-normal whitespace-nowrap"
      >
        {label ?? t.cta.register}
      </BracketButton>

      {/* ---- JOIN TOURNAMENT ---- */}
      <TornDialog
        open={step === "form"}
        onClose={close}
        label={t.register.label}
        closeLabel={t.register.close}
        maxWidthClassName="max-w-[62.75rem]"
        className="px-6 pt-16 pb-14 sm:px-21 sm:pt-18.75 sm:pb-22"
      >
        <h2 className="font-display text-ink text-section-heading font-semibold tracking-[-0.058em] uppercase">
          {t.register.title}
        </h2>
     
        <p className="text-ash font-body text-body mt-1 max-w-115">{t.register.body}</p>

        <dl className="mt-6.25 grid grid-cols-2 gap-y-6 sm:grid-cols-[5.375rem_9.25rem_5.625rem_1fr]">
          <Fact label={t.register.labels.format} value={tournament.format ? t.formats[tournament.format] : ""} />
          <Fact label={t.register.labels.prizePool} value={prize} />
          <Fact label={t.register.labels.region} value={t.regions[tournament.region]} />
          <Fact label={t.register.labels.deadline} value={deadline} />
        </dl>
        <dl className="mt-6.5">
          <Fact label={t.register.labels.slots} value={slots} />
        </dl>

        <div className="mt-12 space-y-0.75">
          <Check ref={rulesBox} checked={rules} onChange={setRules} label={t.register.agreeRules} />
          <Check
            ref={availableBox}
            checked={available}
            onChange={setAvailable}
            label={t.register.agreeAvailable}
          />
        </div>

        <div className="mt-7">
          <BracketButton
            tone="ink"
            field="light"
            onClick={confirm}
            className="px-4 py-4.75 text-center leading-tight tracking-normal sm:leading-none sm:whitespace-nowrap"
          >
            {t.register.confirm}
          </BracketButton>
        </div>
      </TornDialog>

      {/* ---- REGISTRATION SUCCESSFUL ---- */}
      <TornDialog
        open={step === "done"}
        onClose={close}
        label={t.registered.label}
        closeLabel={t.registered.close}
        maxWidthClassName="max-w-[43.6875rem]"
        className="flex flex-col items-center px-6 pt-16.75 pb-12 text-center"
      >
        {/* 124 square, signal, white tick - the merch confirmation's disc. */}
        <span aria-hidden className="bg-signal grid size-31 shrink-0 place-items-center rounded-full">
          <svg
            viewBox="0 0 44 34"
            className="text-menu-fg w-11"
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
          {t.registered.title}
        </h2>

        <p className="text-ash font-body text-body mt-2.5 max-w-120 whitespace-pre-line">
          {t.registered.body.replace("{tournament}", copy.name)}
        </p>

        <div className="mt-13.5">
          <BracketButton
            tone="ink"
            field="light"
            href={profileHref}

            className="px-7.5 py-4.75 leading-none tracking-normal whitespace-nowrap"
          >
            {t.registered.cta}
          </BracketButton>
        </div>
      </TornDialog>
    </>
  );
}

/** One label-over-value pair of the sheet's facts. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate font-body text-body-sm">{label}</dt>
      <dd className="font-display text-ash text-h6 mt-0.5 font-semibold tracking-[-0.055em] uppercase">
        {value}
      </dd>
    </div>
  );
}


function Check({
  ref,
  checked,
  onChange,
  label,
}: {
  ref: React.Ref<HTMLInputElement>;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="text-ash font-body text-body flex cursor-pointer items-center gap-3">
      <span className="relative grid size-4 shrink-0 place-items-center">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer border-ash checked:border-signal checked:bg-signal focus-visible:outline-signal absolute inset-0 size-4 cursor-pointer appearance-none border-[1.5px] transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <svg
          aria-hidden
          viewBox="0 0 12 10"
          className="text-menu-fg pointer-events-none relative hidden w-2.5 peer-checked:block"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 5l3.5 3.5L11 1" />
        </svg>
      </span>
      {label}
    </label>
  );
}
