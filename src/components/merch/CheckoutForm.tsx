"use client";

import { useId, useState } from "react";

import type { Place } from "@/lib/api/geo";
import type { Messages } from "@/lib/utils/messages";

/**
 * Shipping and payment. Figma: `Merch Store- Checkout-New User.png`.
 *
 * Frame at 1440 — shipping panel 93..873 x 138..998 on `--color-pitch`, payment
 * panel 93..873 x 1030..1305 on ink. The two grounds genuinely differ in the
 * frame; that is followed rather than tidied.
 *
 * NOTHING ENTERED HERE IS STORED OR SENT. The values live in component state for
 * the length of the visit and nowhere else — not `localStorage`, not a request.
 * There is no backend to receive them and no consent flow to collect under, so
 * keeping them in memory is the only defensible place for a stranger's name,
 * phone number and home address.
 *
 * NO PAYMENT DETAIL IS COLLECTED ANYWHERE, by design and by the frames: the
 * payment section is a choice between two methods, and neither asks for a card.
 */
export function CheckoutForm({
  messages,
  countries,
  states,
  onMethodChange,
}: {
  messages: Messages;
  countries: readonly Place[];
  states: readonly Place[];
  onMethodChange?: (method: "paystack" | "transfer") => void;
}) {
  const t = messages.merch.checkout;
  const [delivery, setDelivery] = useState<"delivery" | "pickup" | null>(null);
  const [payment, setPayment] = useState<"paystack" | "transfer">("paystack");

  return (
    <div>
      <section className="bg-pitch border-menu-fg/33 border px-8 pt-8.75 pb-9.5">
        <h2 className="font-display text-menu-fg text-[2.1875rem] leading-none font-semibold tracking-[-0.04em] uppercase">
          {t.shipping}
        </h2>

        <h3 className="font-display text-menu-fg mt-8 text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase">
          {t.contact}
        </h3>

        <div className="mt-4.75 grid grid-cols-1 gap-x-4 gap-y-4.5 sm:grid-cols-2">
          <Field label={t.firstName} placeholder={t.firstNamePlaceholder} autoComplete="given-name" />
          <Field label={t.lastName} placeholder={t.lastNamePlaceholder} autoComplete="family-name" />
        </div>

        <div className="mt-3.75">
          <PhoneField messages={messages} />
        </div>

        <div className="mt-3.5">
          <Field label={t.address} placeholder={t.addressPlaceholder} autoComplete="street-address" />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4.5 sm:grid-cols-2">
          <SelectField
            label={t.country}
            placeholder={t.countryPlaceholder}
            options={countries}
            autoComplete="country-name"
          />
          <SelectField
            label={t.state}
            placeholder={t.statePlaceholder}
            options={states}
            autoComplete="address-level1"
          />
        </div>

        <div className="mt-8.75 grid grid-cols-1 gap-x-4 gap-y-4.5 sm:grid-cols-2">
          <Field label={t.city} placeholder={t.cityPlaceholder} autoComplete="address-level2" />
          <Field label={t.zip} placeholder={t.zipPlaceholder} autoComplete="postal-code" />
        </div>

        <h3 className="font-display text-menu-fg mt-8.25 text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase">
          {t.deliveryMethod}
        </h3>

        <div role="radiogroup" aria-label={t.deliveryMethod} className="mt-4.75 flex flex-col gap-3.75">
          <Choice
            checked={delivery === "delivery"}
            onSelect={() => setDelivery("delivery")}
            label={t.delivery}
          />
          <Choice
            checked={delivery === "pickup"}
            onSelect={() => setDelivery("pickup")}
            label={t.pickup}
            note={t.pickupNote}
          />
        </div>
      </section>

      <section className="border-menu-fg/33 mt-8 border px-8 pt-9 pb-8.5">
        <h2 className="font-display text-menu-fg text-[2.1875rem] leading-none font-semibold tracking-[-0.04em] uppercase">
          {t.paymentMethod}
        </h2>

        <div role="radiogroup" aria-label={t.paymentMethod} className="mt-6.25 flex flex-col gap-3.75">
          <Choice
            checked={payment === "paystack"}
            onSelect={() => {
              setPayment("paystack");
              onMethodChange?.("paystack");
            }}
            label={t.paystack}
          />
          <Choice
            checked={payment === "transfer"}
            onSelect={() => {
              setPayment("transfer");
              onMethodChange?.("transfer");
            }}
            label={t.bankTransfer}
          />
        </div>
      </section>
    </div>
  );
}

/** Label above a bordered input, which is the frame's shape for every text field. */
function Field({
  label,
  placeholder,
  autoComplete,
}: {
  label: string;
  placeholder: string;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-menu-fg/70 font-body block text-[0.8125rem] leading-none">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="border-menu-fg/33 text-menu-fg placeholder:text-menu-fg/40 font-body focus-visible:border-menu-fg/70 focus-visible:outline-signal mt-3 h-12 w-full border bg-transparent px-4.5 text-body focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </div>
  );
}

/** The dial code sits inside the field, divided from the number by a hairline. */
function PhoneField({ messages }: { messages: Messages }) {
  const t = messages.merch.checkout;
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-menu-fg/70 font-body block text-[0.8125rem] leading-none">
        {t.phone}
      </label>
      <div className="border-menu-fg/33 focus-within:border-menu-fg/70 mt-3 flex h-12 items-center border">
        <span className="text-menu-fg font-body text-body flex items-center gap-1.5 pr-3.5 pl-4.5">
          {t.dialCode}
          <Caret />
        </span>
        <span aria-hidden className="bg-menu-fg/33 h-6 w-px" />
        <input
          id={id}
          type="tel"
          inputMode="tel"
          placeholder={t.phonePlaceholder}
          autoComplete="tel-national"
          className="text-menu-fg placeholder:text-menu-fg/40 font-body focus-visible:outline-signal h-full flex-1 bg-transparent px-4 text-body focus-visible:outline-2 focus-visible:-outline-offset-2"
        />
      </div>
    </div>
  );
}

/**
 * A select, with the frame's caret.
 *
 * THE FRAME'S "Warning text" UNDER THESE IS NOT COPY — it is a placeholder for a
 * validation message, so the slot exists and stays empty until there is
 * something true to put in it. Printing the words themselves would be shipping
 * a designer's note.
 */
function SelectField({
  label,
  placeholder,
  options,
  autoComplete,
}: {
  label: string;
  placeholder: string;
  options: readonly Place[];
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-menu-fg/70 font-body block text-[0.8125rem] leading-none">
        {label}
      </label>
      <div className="relative mt-3.25">
        <select
          id={id}
          defaultValue=""
          required
          autoComplete={autoComplete}
          className="border-menu-fg/33 text-menu-fg font-body focus-visible:border-menu-fg/70 focus-visible:outline-signal invalid:text-menu-fg/40 h-12 w-full appearance-none border bg-transparent px-4.5 pr-11 text-body focus-visible:outline-2 focus-visible:outline-offset-2 [&>option]:bg-ash [&>option]:text-menu-fg"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute top-1/2 right-4.5 -translate-y-1/2">
          <Caret />
        </span>
      </div>
    </div>
  );
}

/** One bordered radio row, used by both Delivery Method and Payment Method. */
function Choice({
  checked,
  onSelect,
  label,
  note,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  note?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="border-menu-fg/33 focus-visible:outline-signal flex w-full cursor-pointer items-start gap-4.5 border px-6 py-5 text-left transition-colors duration-150 ease-gate hover:border-menu-fg/60 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
          checked ? "border-signal" : "border-menu-fg/60"
        }`}
      >
        {checked ? <span className="bg-signal size-2.5 rounded-full" /> : null}
      </span>
      <span>
        <span className="text-menu-fg font-body text-body block leading-none">{label}</span>
        {note ? (
          <span className="text-menu-fg/70 font-body text-body-sm mt-2 block leading-none">
            {note}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function Caret() {
  return (
    <svg aria-hidden viewBox="0 0 12 8" className="h-2 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 1.5L6 6.5L11 1.5" />
    </svg>
  );
}
