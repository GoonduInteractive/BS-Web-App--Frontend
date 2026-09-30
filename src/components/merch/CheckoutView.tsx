"use client";

import { useState } from "react";

import { CheckoutForm, type DeliveryChoice } from "@/components/merch/CheckoutForm";
import { CheckoutSummary } from "@/components/merch/CheckoutSummary";
import { OrderConfirmed } from "@/components/merch/OrderConfirmed";
import type { Place } from "@/lib/api/geo";
import type { Lga, StateShipping } from "@/lib/api/shipping";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue, Product } from "@/types/merch";
import type { SavedAddress } from "@/types/profile";

/**
 * Holds what the two checkout columns share: where the order is going. The
 * form reports the delivery method, state and local government; the summary
 * prices shipping from them - the local government's own price if it has one,
 * otherwise the state's.
 *
 * PLACE ORDER is the only payment step. On the live site it opens Paystack;
 * here it goes straight to the confirmation. See CheckoutSummary.
 */
export function CheckoutView({
  products,
  comics,
  countries,
  states,
  lgasByState,
  rates,
  saved,
  messages,
  locale,
}: {
  products: readonly Product[];
  comics: readonly ComicIssue[];
  countries: readonly Place[];
  states: readonly Place[];
  lgasByState: Record<string, readonly Lga[]>;
  rates: readonly StateShipping[];
  saved: SavedAddress | null;
  messages: Messages;
  locale: Locale;
}) {
  const [delivery, setDelivery] = useState<DeliveryChoice>({
    method: "homeDelivery",
    state: saved?.state ?? "",
    lgaId: saved?.lgaId ?? "",
  });
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const stateRates = rates.find((r) => r.state === delivery.state);
  const rate = stateRates && delivery.lgaId ? (stateRates.lgas[delivery.lgaId]?.[delivery.method] ?? stateRates[delivery.method]) : null;

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[62.2%_35.3%] lg:justify-between lg:gap-0">
      <CheckoutForm
        messages={messages}
        countries={countries}
        states={states}
        lgasByState={lgasByState}
        saved={saved}
        onDeliveryChange={(choice) => {
          setDelivery(choice);
          setPlaceError(null);
        }}
      />
      <CheckoutSummary
        products={products}
        comics={comics}
        messages={messages}
        locale={locale}
        rate={rate}
        placeError={placeError}
        onPlaceOrder={() => {
          // Shipping can't be priced, so the order can't be placed, until the place is chosen.
          if (rate === null) return setPlaceError(messages.merch.checkout.chooseLocation);
          // NO PAYMENT IS TAKEN: no Paystack key or backend in this build. Live, Paystack opens here.
          setConfirmed(true);
        }}
      />

      <OrderConfirmed messages={messages} open={confirmed} onClose={() => setConfirmed(false)} />
    </div>
  );
}
