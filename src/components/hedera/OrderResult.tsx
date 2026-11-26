"use client";

import { CheckCircle2, CircleAlert, Clock, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { Busy, HashscanLink, Notice } from "@/components/hedera/bits";
import { CTA, PANEL, PANEL_TITLE, QUIET, TEXT_LINK, TILE } from "@/components/hedera/styles";
import { BracketButton } from "@/components/ui/BracketButton";
import { useHbarOrder } from "@/hooks/useHedera";
import { formatFiat, formatHbar, formatMoment } from "@/lib/hedera/format";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { HederaOrder } from "@/types/hedera";

/**
 * The order result (the doc's screen 12): the receipt with its HashScan
 * links, the NFT on its way or in the wallet - "now unlocked in the game" -
 * or, paid but never minted, the refund path.
 */
export function OrderResult({ messages, locale }: { messages: Messages; locale: Locale }) {
  const t = messages.hedera.order;
  const id = useSearchParams().get("id");
  const order = useHbarOrder(id);

  if (!id || order.isError) {
    return <Notice icon={ReceiptText} title={t.receipt} body={t.missing} cta={{ href: `/${locale}/hedera/store`, label: messages.hedera.explainer.store }} />;
  }
  if (!order.data) return <div aria-busy className="h-64" />;

  const o = order.data;
  const name = o.item.kind === "order" ? messages.hedera.checkout.order.replace("{id}", o.item.name) : o.item.name;
  const checkout = `/${locale}/hedera/checkout?id=${encodeURIComponent(o.id)}`;

  if ((o.status === "awaiting" && o.paidHbar === null) || o.status === "expired") {
    return <Notice icon={Clock} title={t.awaitingTitle} body={t.awaitingBody} cta={{ href: checkout, label: t.continue }} />;
  }
  if (o.status === "awaiting" || o.status === "underpaid") {
    return o.status === "underpaid" ? (
      <Receipt order={o} name={name} messages={messages} locale={locale} icon={CircleAlert} title={messages.hedera.checkout.underpaid.title}>
        {messages.hedera.checkout.underpaid.body.replace("{paid}", formatHbar(o.paidHbar ?? 0, messages)).replace("{quote}", formatHbar(o.hbar, messages))}
      </Receipt>
    ) : (
      <Busy>{messages.hedera.checkout.awaiting}</Busy>
    );
  }

  if (o.mint === "failed") {
    return (
      <Receipt order={o} name={name} messages={messages} locale={locale} icon={CircleAlert} title={t.failedTitle}>
        {t.failedBody.replace("{name}", name)}
      </Receipt>
    );
  }
  if (o.mint === "queued" || o.mint === "submitted") {
    return (
      <Receipt order={o} name={name} messages={messages} locale={locale} icon={CheckCircle2} title={t.confirmedTitle}>
        <Busy>{t.minting.replace("{name}", name)}</Busy>
      </Receipt>
    );
  }
  return (
    <Receipt order={o} name={name} messages={messages} locale={locale} icon={CheckCircle2} title={t.confirmedTitle}>
      {o.item.kind === "asset" ? t.unlocked.replace("{name}", name) : t.orderPaid}
    </Receipt>
  );
}

function Receipt({
  order: o,
  name,
  messages,
  locale,
  icon: Icon,
  title,
  children,
}: {
  order: HederaOrder;
  name: string;
  messages: Messages;
  locale: Locale;
  icon: typeof CheckCircle2;
  title: string;
  children: ReactNode;
}) {
  const t = messages.hedera.order;
  const rows: { label: string; value: ReactNode }[] = [
    { label: messages.hedera.checkout.item, value: name },
    { label: t.paid, value: formatHbar(o.paidHbar ?? o.hbar, messages) },
    { label: t.quote, value: `${formatHbar(o.hbar, messages)} · ${formatFiat(o.fiat, locale, messages)}` },
    { label: t.memo, value: o.memo },
    { label: t.date, value: formatMoment(o.createdAt) },
  ];
  if (o.txId) rows.push({ label: t.payment, value: <HashscanLink kind="transaction" value={o.txId} label={messages.hedera.viewOnHashscan} /> });
  if (o.refund) {
    rows.push({
      label: t.refund,
      value: o.refund.txId ? (
        <HashscanLink kind="transaction" value={o.refund.txId} label={t.refundSent} />
      ) : (
        t.refundPending
      ),
    });
  }

  return (
    <section className={PANEL}>
      <Icon aria-hidden className={`size-12 ${Icon === CheckCircle2 ? "text-gild" : "text-signal"}`} strokeWidth={1.5} />
      <h2 className="font-display text-menu-fg mt-6 text-[2rem] leading-none font-semibold tracking-[-0.03em] uppercase">{title}</h2>
      <div className="text-menu-fg/85 font-body text-body mt-3 max-w-[38rem]">{children}</div>

      <div className={`${TILE} mt-8 max-w-[38rem] px-6 py-6`}>
        <h3 className={PANEL_TITLE}>{t.receipt}</h3>
        <dl className="mt-5 flex flex-col">
          {rows.map((r) => (
            <div key={r.label} className="border-menu-fg/12 flex flex-wrap justify-between gap-x-6 gap-y-1 border-b py-3 last:border-b-0">
              <dt className={QUIET}>{r.label}</dt>
              <dd className="text-menu-fg font-body text-body-sm text-right">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
        <BracketButton href={`/${locale}/hedera/hub`} className={CTA}>
          {t.hub}
        </BracketButton>
        <Link href={`/${locale}/hedera/store`} className={TEXT_LINK}>
          {t.store}
        </Link>
      </div>
    </section>
  );
}
