"use client";

import { Clock, ShoppingBag, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Busy, HashscanLink, Notice, PublicNote, Stopped } from "@/components/hedera/bits";
import { HederaArt } from "@/components/hedera/HederaArt";
import { CTA, FIGURE, OUTLINE_BUTTON, PANEL, PANEL_TITLE, QUIET, TEXT_LINK } from "@/components/hedera/styles";
import { BracketButton } from "@/components/ui/BracketButton";
import { useHbarOrder, useHoldings, useRefreshHedera, useWalletLink } from "@/hooks/useHedera";
import { useSeconds } from "@/hooks/useSeconds";
import { ApiError } from "@/lib/api/client";
import { hbarDiscountOff } from "@/hooks/useHbarDiscount";
import { createHbarOrder, getAsset, getHbarDiscountPct } from "@/lib/api/hedera";
import { getOrderSummary } from "@/lib/api/store";
import { formatCountdown, formatFiat, formatHbar } from "@/lib/hedera/format";
import { connectHref } from "@/lib/hedera/links";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { WalletError, walletFor } from "@/lib/wallet";
import type { HederaOrder, PaymentItem } from "@/types/hedera";

/** A new HBAR order for an exclusive, or for a merch or comics order already placed. */
async function quoteFor(what: { assetId: string } | { siteOrder: string }): Promise<HederaOrder> {
  if ("assetId" in what) {
    const asset = await getAsset(what.assetId);
    if (!asset?.price) throw new ApiError(409, "Not on sale");
    return createHbarOrder({ kind: "asset", assetId: asset.id, name: asset.name, image: asset.image }, asset.price);
  }
  // Paid in HBAR, the order costs a little less (the admin's Treasury setting; the team, 2026-11-23).
  const [placed, pct] = await Promise.all([getOrderSummary(what.siteOrder), getHbarDiscountPct()]);
  const off = hbarDiscountOff(placed.total, pct);
  return createHbarOrder(
    { kind: "order", orderId: placed.id, name: placed.number, ...(off > 0 ? { listPrice: placed.total, discountPct: pct } : {}) },
    { amount: placed.total - off, currency: "NGN" },
  );
}

const again = (item: PaymentItem) => (item.kind === "asset" ? { assetId: item.assetId } : { siteOrder: item.orderId });

/**
 * HBAR checkout (the doc's screen 11, flow D). `?asset=` (an exclusive) or
 * `?order=` (a merch or comics order) makes a payment intent once and puts
 * its `?id=` in the address, so a reload shows the same quote. The quote
 * counts down from 10 minutes; the player approves one payment carrying the
 * order's memo; the gateway confirms it and the receipt takes over. States: no
 * wallet, quote live, quote expired, awaiting payment, confirmed, underpaid,
 * failed.
 */
export function HbarCheckout({ messages, locale }: { messages: Messages; locale: Locale }) {
  const t = messages.hedera.checkout;
  const params = useSearchParams();
  const id = params.get("id");
  const assetId = params.get("asset");
  const siteOrder = params.get("order");
  const router = useRouter();
  const pathname = usePathname();
  const link = useWalletLink();
  const holdings = useHoldings();
  const refresh = useRefreshHedera();
  const order = useHbarOrder(id);
  const now = useSeconds();
  const [problem, setProblem] = useState<"unavailable" | "error" | null>(null);
  const [paying, setPaying] = useState<"idle" | "signing" | "rejected" | "failed">("idle");
  const started = useRef<string | null>(null);

  const open = (created: HederaOrder) => router.replace(`${pathname}?id=${encodeURIComponent(created.id)}`);
  const refuse = (e: unknown) => setProblem(e instanceof ApiError && e.status === 409 ? "unavailable" : "error");

  // The intent is made once per item (an effect runs twice in development).
  useEffect(() => {
    const key = assetId ?? siteOrder;
    if (id || !key || !link.data || started.current === key) return;
    started.current = key;
    quoteFor(assetId ? { assetId } : { siteOrder: key }).then(open, refuse);
    // `open` and `refuse` only close over the router and a setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, assetId, siteOrder, link.data]);

  // Confirmed: the receipt takes over.
  useEffect(() => {
    if (order.data?.status === "confirmed" && id) router.replace(`/${locale}/hedera/order?id=${encodeURIComponent(id)}`);
  }, [order.data?.status, id, locale, router]);

  if (!id && !assetId && !siteOrder) {
    return <Notice icon={ShoppingBag} title={t.title} body={t.nothing} cta={{ href: `/${locale}/hedera/store`, label: messages.hedera.explainer.store }} />;
  }
  if (link.isPending) return <div aria-busy className="h-64" />;
  if (!link.data) {
    const here = `${pathname}?${params.toString()}`;
    return <Notice icon={Wallet} title={t.noWallet.title} body={t.noWallet.body} cta={{ href: connectHref(locale, here), label: t.noWallet.cta }} />;
  }
  if (problem) {
    return (
      <section className={PANEL}>
        <Stopped>{problem === "unavailable" ? t.unavailable : messages.hedera.error}</Stopped>
        <Link href={`/${locale}/hedera/store`} className={`${TEXT_LINK} mt-6 inline-block`}>
          {messages.hedera.order.store}
        </Link>
      </section>
    );
  }
  if (!order.data) return <Busy>{t.quoting}</Busy>;

  const o = order.data;
  const left = now === null ? null : Date.parse(o.expiresAt) - now * 1000;
  const expired = o.status === "expired" || (o.status === "awaiting" && o.paidHbar === null && left !== null && left <= 0);

  const requote = () => {
    setProblem(null);
    quoteFor(again(o.item)).then(open, refuse);
  };

  const pay = async () => {
    if (!link.data) return;
    setPaying("signing");
    try {
      await walletFor(link.data.door).pay(link.data.accountId, { to: o.payTo, hbar: o.hbar, memo: o.memo });
      setPaying("idle");
      await refresh();
    } catch (e) {
      setPaying(e instanceof WalletError && e.reason === "rejected" ? "rejected" : "failed");
    }
  };

  if (expired) {
    return (
      <Notice
        icon={Clock}
        title={t.expired.title}
        body={t.expired.body}
        action={
          <BracketButton onClick={requote} className={CTA}>
            {t.expired.cta}
          </BracketButton>
        }
      />
    );
  }
  if (o.status === "underpaid") {
    const u = t.underpaid;
    return (
      <Notice
        icon={Wallet}
        title={u.title}
        body={
          <>
            {u.body.replace("{paid}", formatHbar(o.paidHbar ?? 0, messages)).replace("{quote}", formatHbar(o.hbar, messages))}
            {o.refund ? (
              <span className="mt-3 block">
                {o.refund.status === "sent" ? messages.hedera.order.refundSent : messages.hedera.order.refundPending}
                {o.refund.txId ? <HashscanLink kind="transaction" value={o.refund.txId} label={messages.hedera.viewOnHashscan} className="ml-3" /> : null}
              </span>
            ) : null}
          </>
        }
      />
    );
  }

  const sent = o.paidHbar !== null;
  const balance = holdings.data?.hbar;
  const low = balance !== undefined && balance < o.hbar;

  return (
    <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <section className={PANEL}>
        <h2 className={PANEL_TITLE}>{t.item}</h2>
        {o.item.kind === "asset" ? (
          <div className="relative mt-6 aspect-[4/5] w-full max-w-60 overflow-hidden rounded-lg bg-ash">
            <Image src={o.item.image} alt="" aria-hidden fill sizes="240px" className="object-cover object-top" />
          </div>
        ) : (
          // A merch order has no picture of its own: the stand-in art fills the slot (`lib/hedera/art.ts`).
          <div className="mt-6 w-full max-w-60">
            <HederaArt art="orderItem" variant="tile" />
          </div>
        )}
        <p className="font-display text-menu-fg mt-6 text-[1.75rem] leading-none font-semibold tracking-[-0.03em] uppercase">
          {o.item.kind === "order" ? t.order.replace("{id}", o.item.name) : o.item.name}
        </p>
        <p className={`${QUIET} mt-3`}>
          {t.price}: {formatFiat(o.fiat, locale, messages)}
        </p>
        {o.item.kind === "order" && o.item.listPrice && o.item.discountPct ? (
          <p className={`${QUIET} mt-1.5`}>
            {messages.hedera.payWith.discountNote
              .replace("{pct}", String(o.item.discountPct))
              .replace("{amount}", formatFiat({ amount: o.item.listPrice, currency: "NGN" }, locale, messages))}
          </p>
        ) : null}
      </section>

      <section className={PANEL}>
        <h2 className={PANEL_TITLE}>{t.youPay}</h2>
        <p className={`${FIGURE} mt-5 text-[3.25rem] tracking-[-0.04em]`}>{formatHbar(o.hbar, messages)}</p>
        {!sent ? <p className="text-menu-fg/85 font-body text-body-sm mt-3">{t.expiresIn.replace("{time}", left === null ? "--:--" : formatCountdown(left))}</p> : null}

        <dl className="border-menu-fg/12 mt-7 grid grid-cols-1 gap-5 border-t pt-7 sm:grid-cols-3">
          <div>
            <dt className={QUIET}>{t.payTo}</dt>
            <dd className="mt-1.5">
              <HashscanLink kind="account" value={o.payTo} label={o.payTo} />
            </dd>
          </div>
          <div>
            <dt className={QUIET}>{t.memo}</dt>
            <dd className="text-menu-fg font-display mt-1.5 text-[1.25rem] leading-none font-semibold tracking-[0.06em]">{o.memo}</dd>
          </div>
          <div>
            <dt className={QUIET}>{t.from}</dt>
            <dd className="text-menu-fg font-body text-body mt-1.5">{link.data.accountId}</dd>
          </div>
        </dl>

        <div className="mt-8">
          {sent ? (
            <Busy>{t.awaiting}</Busy>
          ) : paying === "signing" ? (
            <Busy>{t.paying}</Busy>
          ) : (
            <>
              {balance !== undefined ? <p className={QUIET}>{t.balance.replace("{amount}", formatHbar(balance, messages))}</p> : null}
              {low ? <Stopped className="mt-2">{t.low}</Stopped> : null}
              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
                <BracketButton onClick={() => void pay()} disabled={low || o.status !== "awaiting"} className={CTA}>
                  {t.pay.replace("{amount}", formatHbar(o.hbar, messages))}
                </BracketButton>
              </div>
              <p className={`${QUIET} mt-4 max-w-[30rem]`}>{t.payNote}</p>
              {paying === "rejected" ? <Stopped className="mt-4">{t.rejected}</Stopped> : null}
              {paying === "failed" || o.status === "failed" ? (
                <div className="mt-4">
                  <Stopped>{t.failed}</Stopped>
                  <button type="button" onClick={() => void pay()} className={`${OUTLINE_BUTTON} mt-4`}>
                    {messages.hedera.retry}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
        <PublicNote messages={messages} className="mt-8 max-w-[34rem]" />
      </section>
    </div>
  );
}
