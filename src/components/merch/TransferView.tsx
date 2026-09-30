"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/merch/CartProvider";
import { OrderConfirmed } from "@/components/merch/OrderConfirmed";
import { SupportNote } from "@/components/ui/SupportNote";
import type { TransferAccount } from "@/lib/api/payment";
import { formatPrice } from "@/lib/utils/price";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { entryTotal, resolveCartLines } from "@/lib/utils/cart-entry";
import type { ComicIssue, Product } from "@/types/merch";


export function TransferView({
  account,
  products,
  comics,
  messages,
  locale,
}: {
  account: TransferAccount;
  products: readonly Product[];
  comics: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
}) {
  const { lines } = useCart();
  const t = messages.merch;
  const x = t.transfer;
  const [confirmed, setConfirmed] = useState(false);

  const total = resolveCartLines({ lines, products, comics, messages, locale }).reduce(
    (sum, entry) => sum + entryTotal(entry),
    0,
  );
  const amount = formatPrice(total, locale, t.price);

  const [head, tail] = x.heading.split("{window}");

  return (
    <>
      <h1 className="font-display text-menu-fg mx-auto max-w-[52.5rem] text-center text-[1.9375rem] leading-none font-semibold tracking-[-0.02em] uppercase md:leading-[1.3]">
        {head}
        <span className="text-gild">{x.window}</span>
        {tail}
      </h1>

      <div className="mx-auto mt-10 max-w-[51.125rem] bg-[url('/assets/ornaments/tear-sheet.svg')] bg-size-[100%_100%] bg-center bg-no-repeat px-6 pt-17 pb-12 md:mt-28.25 md:px-21.25 md:pt-20.75 md:pb-29.5">
        <Detail label={x.accountNumber} value={account.accountNumber} copy={x} big />
        <Detail label={x.bankName} value={account.bankName} className="mt-11 md:mt-10.5" big />
        <Detail label={x.beneficiary} value={account.beneficiary} className="mt-11 md:mt-10.5" big />
        <Detail label={x.amount} value={amount} copy={x} className="mt-11 md:mt-10.5" big />

        <p className="text-signal font-body text-body-sm mt-3 flex items-start gap-2 leading-tight md:mt-2.5 md:items-center md:leading-none">
          <InfoGlyph />
          {x.warning}
        </p>

        <div className="mt-13.75 flex flex-col gap-4 sm:flex-row sm:gap-12.25">
          <Link
            href={`/${locale}/merch/checkout`}
            className="border-ink text-ink font-body focus-visible:outline-signal flex h-13.75 items-center justify-center border sm:flex-1 text-[1.0625rem] leading-none transition-colors duration-150 ease-gate hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {x.changeMethod}
          </Link>

          <button
            type="button"
            onClick={() => setConfirmed(true)}
            className="bg-ink text-menu-fg font-body focus-visible:outline-signal flex h-13.75 cursor-pointer items-center justify-center sm:flex-1 text-[1.0625rem] leading-none transition-opacity duration-150 ease-gate hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {x.sent}
          </button>
        </div>
      </div>

      <SupportNote messages={messages} layout="inline" className="mt-8" />

      <OrderConfirmed messages={messages} open={confirmed} onClose={() => setConfirmed(false)} />
    </>
  );
}

function Detail({
  label,
  value,
  copy,
  className = "",
  big = false,
}: {
  label: string;
  value: string;
  copy?: { copy: string; copied: string };
  className?: string;
  big?: boolean;
}) {
  const [done, setDone] = useState(false);

  return (
    <div className={className}>
      <p className="text-ink/70 font-body text-body-sm leading-none">{label}</p>
      <div className="mt-2.5 flex items-center gap-3.5">
        <p
          className={`text-ink font-display leading-none font-semibold ${
            // The phone frame sets the values at 22px (cap 14), the desktop at 31.
            big ? "text-[1.375rem] tracking-[-0.02em] md:text-[1.9375rem]" : "text-body"
          }`}
        >
          {value}
        </p>

        {copy ? (
          <button
            type="button"
            onClick={() => {
              // Clipboard access can be refused (insecure origin, permissions).
              // The label only changes when the write actually succeeded.
              void navigator.clipboard
                ?.writeText(value)
                .then(() => {
                  setDone(true);
                  window.setTimeout(() => setDone(false), 2000);
                })
                .catch(() => {});
            }}
            className="border-ember text-ink font-body text-body-sm focus-visible:outline-signal cursor-pointer border px-3 py-2 leading-none transition-colors duration-150 ease-gate hover:bg-signal/10 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span aria-live="polite">{done ? copy.copied : copy.copy}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InfoGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="7" />
      <path d="M8 4.5v.5M8 7v4.5" strokeLinecap="round" />
    </svg>
  );
}
