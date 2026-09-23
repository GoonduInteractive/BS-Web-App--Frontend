"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CheckoutForm } from "@/components/merch/CheckoutForm";
import { CheckoutSummary } from "@/components/merch/CheckoutSummary";
import { OrderConfirmed } from "@/components/merch/OrderConfirmed";
import type { Place } from "@/lib/api/geo";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue, Product } from "@/types/merch";

/**
 * Holds the one piece of state the two checkout columns share: which payment
 * method is chosen, because it decides where PLACE ORDER goes - Bank Transfer
 * to the transfer instructions, Paystack straight to the confirmation.
 *
 * Neither destination takes a payment. See CheckoutSummary.
 */
export function CheckoutView({
  products,
  comics,
  countries,
  states,
  messages,
  locale,
}: {
  products: readonly Product[];
  comics: readonly ComicIssue[];
  countries: readonly Place[];
  states: readonly Place[];
  messages: Messages;
  locale: Locale;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"paystack" | "transfer">("paystack");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[62.2%_35.3%] lg:justify-between lg:gap-0">
      <CheckoutForm messages={messages} countries={countries} states={states} onMethodChange={setMethod} />
      <CheckoutSummary
        products={products}
        comics={comics}
        messages={messages}
        locale={locale}
        onPlaceOrder={() => {
          // NEITHER BRANCH TAKES A PAYMENT. Bank Transfer goes to the account
          // details, Paystack straight to the confirmation - no provider is
          // loaded and no card detail exists to send anywhere.
          if (method === "transfer") {
            router.push(`/${locale}/merch/checkout/transfer`);
            return;
          }
          setConfirmed(true);
        }}
      />

      <OrderConfirmed messages={messages} open={confirmed} onClose={() => setConfirmed(false)} />
    </div>
  );
}
