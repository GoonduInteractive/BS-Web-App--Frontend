"use client";

import { useId, useState } from "react";

import type { Place } from "@/lib/api/geo";
import type { DeliveryMethod, Lga } from "@/lib/api/shipping";
import type { Messages } from "@/lib/utils/messages";
import type { SavedAddress } from "@/types/profile";

/** Where the order is going, as far as pricing it needs: method, state, local government. */
export type DeliveryChoice = { method: DeliveryMethod; state: string; lgaId: string };

/**
 * Shipping details. Figma: `Merch Store- Checkout-New User.png`, re-ordered by
 * the team's checkout decisions (2026-09-29):
 *
 * - DELIVERY METHOD COMES FIRST, Home Delivery first and chosen by default,
 *   because it decides which address fields follow.
 * - PICKUP ASKS ONLY FOR STATE AND LOCAL GOVERNMENT. The parcel goes to a
 *   transport company's collection centre there; a customer who'd rather not
 *   share a home address doesn't have to (NDPR). Name and phone stay, to collect.
 * - A signed-in player's saved details pre-fill every field, and every field
 *   stays editable so they can order for someone else.
 * - NO PAYMENT SECTION. Every payment goes through Paystack, whose window offers
 *   card, transfer and USSD itself; PLACE ORDER opens it.
 *
 * NOTHING ENTERED HERE IS STORED OR SENT. The values live in component state for
 * the length of the visit and nowhere else - not `localStorage`, not a request.
 * There is no backend to receive them and no consent flow to collect under.
 */
export function CheckoutForm({
  messages,
  countries,
  states,
  lgasByState,
  saved,
  shipping = true,
  onDeliveryChange,
}: {
  messages: Messages;
  countries: readonly Place[];
  states: readonly Place[];
  /** Local governments by state name, from `nigeria-lga-data`. */
  lgasByState: Record<string, readonly Lga[]>;
  saved: SavedAddress | null;
  /** False when nothing in the cart ships (online chapters only): no delivery method or address is asked for. */
  shipping?: boolean;
  onDeliveryChange: (choice: DeliveryChoice) => void;
}) {
  const t = messages.merch.checkout;
  const [method, setMethod] = useState<DeliveryMethod>("homeDelivery");
  const [values, setValues] = useState({
    firstName: saved?.firstName ?? "",
    lastName: saved?.lastName ?? "",
    phone: saved?.phone ?? "",
    line1: saved?.line1 ?? "",
    city: saved?.city ?? "",
    zip: saved?.zip ?? "",
    country: saved ? "ng" : "",
    state: saved?.state ?? "",
    lgaId: saved?.lgaId ?? "",
  });
  const set = (key: keyof typeof values) => (value: string) => setValues((v) => ({ ...v, [key]: value }));
  const lgas = values.state ? (lgasByState[values.state] ?? []) : [];

  const report = (next: Partial<DeliveryChoice>) => onDeliveryChange({ method, state: values.state, lgaId: values.lgaId, ...next });
  const chooseMethod = (m: DeliveryMethod) => {
    setMethod(m);
    report({ method: m });
  };
  // A new state empties the local government: the old one belongs to another state.
  const chooseState = (name: string) => {
    setValues((v) => ({ ...v, state: name, lgaId: "" }));
    report({ state: name, lgaId: "" });
  };
  const chooseLga = (id: string) => {
    set("lgaId")(id);
    report({ lgaId: id });
  };

  const stateField = (
    <SelectField
      label={t.state}
      placeholder={t.statePlaceholder}
      options={states.map((s) => ({ code: s.name, name: s.name }))}
      value={values.state}
      onChange={chooseState}
      autoComplete="address-level1"
    />
  );
  const lgaField = (
    <SelectField
      label={t.lga}
      placeholder={values.state ? t.lgaPlaceholder : t.lgaNeedsState}
      options={lgas.map((l) => ({ code: l.id, name: l.name }))}
      value={values.lgaId}
      onChange={chooseLga}
      disabled={!values.state}
    />
  );

  return (
    <section className="bg-pitch border-menu-fg/33 border px-8 pt-8.75 pb-9.5">
      <h2 className="font-display text-menu-fg text-[2.1875rem] leading-none font-semibold tracking-[-0.04em] uppercase">
        {t.shipping}
      </h2>

      {shipping ? (
        <>
          <h3 className="font-display text-menu-fg mt-8 text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase">
            {t.deliveryMethod}
          </h3>

          <div role="radiogroup" aria-label={t.deliveryMethod} className="mt-4.75 flex flex-col gap-3.75">
            <Choice checked={method === "homeDelivery"} onSelect={() => chooseMethod("homeDelivery")} label={t.delivery} note={t.homeDeliveryNote} />
            <Choice checked={method === "pickup"} onSelect={() => chooseMethod("pickup")} label={t.pickup} note={t.pickupNote} />
          </div>
        </>
      ) : (
        // Online chapters only: they open in the reader, so there is nowhere to send anything.
        <p className="text-menu-fg/70 font-body text-body-sm mt-5 leading-snug">{t.nothingToShip}</p>
      )}

      <h3 className="font-display text-menu-fg mt-8.25 text-[1.375rem] leading-none font-semibold tracking-[0.01em] uppercase">
        {t.contact}
      </h3>

      <div className="mt-4.75 grid grid-cols-1 gap-x-4 gap-y-4.5 sm:grid-cols-2">
        <Field label={t.firstName} placeholder={t.firstNamePlaceholder} autoComplete="given-name" value={values.firstName} onChange={set("firstName")} />
        <Field label={t.lastName} placeholder={t.lastNamePlaceholder} autoComplete="family-name" value={values.lastName} onChange={set("lastName")} />
      </div>

      <div className="mt-3.75">
        <PhoneField messages={messages} value={values.phone} onChange={set("phone")} />
      </div>

      {!shipping ? null : method === "homeDelivery" ? (
        <>
          <div className="mt-3.5">
            <Field label={t.address} placeholder={t.addressPlaceholder} autoComplete="street-address" value={values.line1} onChange={set("line1")} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4.5 sm:grid-cols-2">
            <SelectField
              label={t.country}
              placeholder={t.countryPlaceholder}
              options={countries}
              value={values.country}
              onChange={set("country")}
              autoComplete="country-name"
            />
            {stateField}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4.5 sm:grid-cols-2">
            {lgaField}
            <Field label={t.city} placeholder={t.cityPlaceholder} autoComplete="address-level2" value={values.city} onChange={set("city")} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4.5 sm:grid-cols-2">
            <Field label={t.zip} placeholder={t.zipPlaceholder} autoComplete="postal-code" value={values.zip} onChange={set("zip")} />
          </div>
        </>
      ) : (
        <>
          <p className="text-menu-fg/70 font-body text-body-sm mt-5 leading-snug">{t.pickupPrivacy}</p>
          <div className="mt-3.5 grid grid-cols-1 gap-x-4 gap-y-4.5 sm:grid-cols-2">
            {stateField}
            {lgaField}
          </div>
        </>
      )}
    </section>
  );
}

/** Label above a bordered input, which is the frame's shape for every text field. */
function Field({
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-menu-fg/33 text-menu-fg placeholder:text-menu-fg/40 font-body focus-visible:border-menu-fg/70 focus-visible:outline-signal mt-3 h-12 w-full border bg-transparent px-4.5 text-body focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </div>
  );
}

/** The dial code sits inside the field, divided from the number by a hairline. */
function PhoneField({ messages, value, onChange }: { messages: Messages; value: string; onChange: (value: string) => void }) {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-menu-fg placeholder:text-menu-fg/40 font-body focus-visible:outline-signal h-full flex-1 bg-transparent px-4 text-body focus-visible:outline-2 focus-visible:-outline-offset-2"
        />
      </div>
    </div>
  );
}

/**
 * A select, with the frame's caret.
 *
 * THE FRAME'S "Warning text" UNDER THESE IS NOT COPY - it is a placeholder for a
 * validation message, so the slot exists and stays empty until there is
 * something true to put in it. Printing the words themselves would be shipping
 * a designer's note.
 */
function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  autoComplete,
}: {
  label: string;
  placeholder: string;
  options: readonly Place[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
          autoComplete={autoComplete}
          className="border-menu-fg/33 text-menu-fg font-body focus-visible:border-menu-fg/70 focus-visible:outline-signal invalid:text-menu-fg/40 h-12 w-full appearance-none border bg-transparent px-4.5 pr-11 text-body focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 [&>option]:bg-ash [&>option]:text-menu-fg"
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

/** One bordered radio row: a Delivery Method option. */
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
