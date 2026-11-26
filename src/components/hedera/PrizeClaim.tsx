"use client";

import { ArrowRight, CheckCircle2, CircleAlert, Clock, ShieldCheck, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthField, AuthSelect } from "@/components/auth/AuthField";
import { HashscanLink, Notice, Stopped } from "@/components/hedera/bits";
import { CTA, FIGURE, OUTLINE_BUTTON, PANEL, PANEL_TITLE, QUIET, TILE } from "@/components/hedera/styles";
import { BracketButton } from "@/components/ui/BracketButton";
import { usePrizes, useRefreshHedera, useWalletLink } from "@/hooks/useHedera";
import { submitPrizeIdentity } from "@/lib/api/hedera";
import { formatDay, formatHbar } from "@/lib/hedera/format";
import { connectHref } from "@/lib/hedera/links";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { HederaPrize, IdentityCheck, PrizeStatus } from "@/types/hedera";

/**
 * An HBAR tournament prize (the doc's screen 13, flow E): the amount, the
 * identity check when it's above the threshold, then an admin's approval and
 * the payout to the verified wallet - never anywhere else.
 *
 * THE KYC FLOW (the team, 2026-11-23): a prize over the threshold asks the
 * player, in the bell, by email and on their hub, to confirm it's them; they
 * send the form; the team checks it (reviewing); it passes on to approval, or
 * comes back with the team's note (resubmit) and the form again. The steps
 * across the top say where it stands.
 *
 * And the whole tournament, not just the receipt (the team, 2026-11-23):
 * where and when it was played, how many played, and the player's place.
 */
export function PrizeClaim({ messages, locale }: { messages: Messages; locale: Locale }) {
  const t = messages.hedera.prize;
  const params = useSearchParams();
  const id = params.get("id");
  const prizes = usePrizes();
  const link = useWalletLink();

  if (prizes.isPending || link.isPending) return <div aria-busy className="h-64" />;
  const prize = prizes.data?.find((p) => p.id === id);
  if (!prize) return <Notice icon={Trophy} title={t.title} body={t.missing} cta={{ href: `/${locale}/hedera/hub`, label: messages.hedera.order.hub }} />;

  const head = (
    <div className="mb-8">
      <p className="text-menu-fg/70 font-body text-body-sm leading-none">
        {prize.tournament} · {t.place.replace("{n}", String(prize.place))}
      </p>
      <p className={`${FIGURE} mt-4 text-[3.25rem] tracking-[-0.04em]`}>{formatHbar(prize.hbar, messages)}</p>
      {prize.needsIdentity ? <Steps status={prize.status} messages={messages} /> : null}
    </div>
  );

  let body: React.ReactNode;
  if (!link.data && prize.status !== "sent") {
    body = (
      <Notice
        icon={Wallet}
        title={t.noWallet.title}
        body={t.noWallet.body}
        cta={{ href: connectHref(locale, `/${locale}/hedera/prize?${params.toString()}`), label: t.noWallet.cta }}
      />
    );
  } else if (prize.status === "verify") {
    body = <IdentityForm key="verify" prizeId={prize.id} title={t.verify.title} intro={t.verify.body} messages={messages} />;
  } else if (prize.status === "resubmit") {
    body = (
      <IdentityForm key="resubmit" prizeId={prize.id} title={t.resubmit.title} intro={t.resubmit.body} messages={messages}>
        {prize.identityNote ? (
          <p className="border-signal text-menu-fg font-body text-body mt-5 max-w-[36rem] border-l-2 pl-4">{prize.identityNote}</p>
        ) : null}
      </IdentityForm>
    );
  } else if (prize.status === "reviewing") {
    body = <State icon={ShieldCheck} title={t.reviewing.title} body={t.reviewing.body} />;
  } else if (prize.status === "pending") {
    body = <State icon={Clock} title={t.pending.title} body={t.pending.body} />;
  } else if (prize.status === "sent") {
    body = (
      <State
        icon={CheckCircle2}
        title={t.sent.title}
        body={t.sent.body.replace("{amount}", formatHbar(prize.hbar, messages)).replace("{account}", link.data?.accountId ?? "")}
      >
        {prize.txId ? <HashscanLink kind="transaction" value={prize.txId} label={messages.hedera.viewOnHashscan} className="mt-5" /> : null}
      </State>
    );
  } else {
    body = <State icon={CircleAlert} title={t.failed.title} body={t.failed.body} />;
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <section className={PANEL}>
        {head}
        {body}
      </section>
      <TournamentDetails prize={prize} messages={messages} locale={locale} />
    </div>
  );
}

/** Where the identity check stands: send it, we check it, approval, sent. */
function Steps({ status, messages }: { status: PrizeStatus; messages: Messages }) {
  const s = messages.hedera.prize.steps;
  const steps = [s.send, s.check, s.approve, s.sent];
  const at = status === "verify" || status === "resubmit" ? 0 : status === "reviewing" ? 1 : status === "pending" ? 2 : 3;

  return (
    <ol className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
      {steps.map((label, i) => (
        <li
          key={label}
          aria-current={i === at ? "step" : undefined}
          className={`font-body text-body-sm flex items-center gap-2.5 leading-none ${i <= at ? "text-menu-fg" : "text-menu-fg/45"}`}
        >
          <span
            aria-hidden
            className={cn(
              "grid size-6 place-items-center rounded-full border text-[0.75rem]",
              i < at ? "bg-gild border-gild text-ink" : i === at ? "border-gild text-gild" : "border-menu-fg/30",
            )}
          >
            {i + 1}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}

function TournamentDetails({ prize, messages, locale }: { prize: HederaPrize; messages: Messages; locale: Locale }) {
  const d = messages.hedera.prize.details;
  const facts: [string, string][] = [
    [d.region, prize.region],
    [d.played, `${formatDay(prize.startedAt)} – ${formatDay(prize.endedAt)}`],
    [d.players, String(prize.players)],
    [d.place, messages.hedera.prize.place.replace("{n}", String(prize.place))],
    [d.prize, formatHbar(prize.hbar, messages)],
  ];

  return (
    <section className={PANEL}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <h2 className={PANEL_TITLE}>{d.title}</h2>
          <p className="font-display text-menu-fg mt-5 text-[2rem] leading-none font-semibold tracking-[-0.03em] uppercase">{prize.tournament}</p>
        </div>
        {/* To the tournament itself: its bracket, its rules, how it played out (the human, 2026-11-23). */}
        <Link href={`/${locale}/competition/${prize.tournamentSlug}`} className={`${OUTLINE_BUTTON} group`}>
          {d.view}
          <ArrowRight aria-hidden className="ease-gate size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" strokeWidth={1.75} />
        </Link>
      </div>
      <dl className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {facts.map(([label, value]) => (
          <div key={label} className={`${TILE} px-5 py-4`}>
            <dt className={QUIET}>{label}</dt>
            <dd className="font-display text-menu-fg mt-2 text-[1.25rem] leading-none font-semibold tracking-[-0.02em]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function State({ icon: Icon, title, body, children }: { icon: typeof Clock; title: string; body: string; children?: React.ReactNode }) {
  return (
    <div>
      <Icon aria-hidden className={`size-10 ${Icon === CircleAlert ? "text-signal" : "text-gild"}`} strokeWidth={1.5} />
      <h2 className="font-display text-menu-fg mt-5 text-[2rem] leading-none font-semibold tracking-[-0.03em] uppercase">{title}</h2>
      <p className="text-menu-fg/85 font-body text-body mt-3 max-w-[36rem]">{body}</p>
      {children}
    </div>
  );
}

function IdentityForm({
  prizeId,
  title,
  intro,
  messages,
  children,
}: {
  prizeId: string;
  title: string;
  intro: string;
  messages: Messages;
  /** The team's note, when the check came back. */
  children?: React.ReactNode;
}) {
  const t = messages.hedera.prize.verify;
  const refresh = useRefreshHedera();
  const [form, setForm] = useState<IdentityCheck>({ fullName: "", dateOfBirth: "", idType: "nin", idNumber: "" });
  const [state, setState] = useState<"idle" | "busy" | "missing" | "error">("idle");
  const set = (key: keyof IdentityCheck) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.dateOfBirth || !form.idNumber.trim()) return setState("missing");
    setState("busy");
    try {
      await submitPrizeIdentity(prizeId, form);
      await refresh();
    } catch {
      setState("error");
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="font-display text-menu-fg text-[2rem] leading-none font-semibold tracking-[-0.03em] uppercase">{title}</h2>
      <p className="text-menu-fg/85 font-body text-body mt-3 max-w-[36rem]">{intro}</p>
      {children}
      <div className="mt-7 grid max-w-[36rem] grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <AuthField label={t.fullName} autoComplete="name" value={form.fullName} onChange={set("fullName")} />
        </div>
        <AuthField label={t.dob} type="date" autoComplete="bday" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
        <AuthSelect
          label={t.idType}
          placeholder={t.idType}
          options={(["nin", "passport", "drivers", "voters"] as const).map((v) => ({ value: v, label: t.idTypes[v] }))}
          value={form.idType}
          onChange={set("idType")}
        />
        <div className="sm:col-span-2">
          <AuthField label={t.idNumber} value={form.idNumber} onChange={set("idNumber")} />
        </div>
      </div>
      {state === "missing" ? <Stopped className="mt-5">{t.missing}</Stopped> : null}
      {state === "error" ? <Stopped className="mt-5">{messages.hedera.error}</Stopped> : null}
      <div className="mt-8">
        <BracketButton type="submit" disabled={state === "busy"} aria-busy={state === "busy" || undefined} className={CTA}>
          {t.submit}
        </BracketButton>
      </div>
      <p className={`${QUIET} mt-5 max-w-[36rem]`}>{messages.hedera.explainer.rules.adults}</p>
    </form>
  );
}
