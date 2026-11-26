"use client";

import { ArrowLeft, CheckCircle2, QrCode, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { AuthField } from "@/components/auth/AuthField";
import { Busy, PublicNote, Stopped } from "@/components/hedera/bits";
import { CTA, FIGURE, OUTLINE_BUTTON, PANEL, QUIET, TEXT_LINK, TILE } from "@/components/hedera/styles";
import { BracketButton } from "@/components/ui/BracketButton";
import { useRefreshHedera, useWalletLink } from "@/hooks/useHedera";
import { cancelWalletLink, confirmWalletLink, createLinkChallenge, verifyWalletLink } from "@/lib/api/hedera";
import { safeNext } from "@/lib/hedera/links";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";
import { WalletError, walletFor } from "@/lib/wallet";
import type { PendingLink } from "@/types/hedera";

type Step =
  | { at: "choose" }
  | { at: "existing"; phase: "pairing" | "signing" | "checking" | "rejected" | "timeout" | "error"; uri: string | null }
  | { at: "embedded"; phase: "choose" | "creating" | "failed" | "error" }
  | { at: "confirm"; account: PendingLink; busy: boolean; failed: boolean }
  | { at: "done" };

/**
 * Linking a wallet (the doc's screens 3 to 6, flow B): choose a door; pair
 * HashPack and sign the backend's one-time challenge, or create an embedded
 * wallet with Google or email; see the account ID back and confirm it. Done
 * once - after this the player only signs when HBAR leaves the wallet.
 *
 * The wallet here is the MOCK (`lib/wallet/mock.ts`). The QR on a desktop is
 * a placeholder glyph: the real one is drawn from the pairing URI once the
 * HashPack connector is wired. FLAGGED.
 */
export function ConnectFlow({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.hedera.connect;
  const next = safeNext(useSearchParams().get("next"), locale);
  const link = useWalletLink();
  const refresh = useRefreshHedera();
  const [step, setStep] = useState<Step>({ at: "choose" });
  // A flow left part-way (Back) must not land on a later screen when its wallet answers.
  const run = useRef(0);

  const verify = async (account: PendingLink, signature: string, live: () => boolean) => {
    const pending = await verifyWalletLink(account, signature);
    if (live()) setStep({ at: "confirm", account: pending, busy: false, failed: false });
  };

  const startExisting = async () => {
    const id = ++run.current;
    const live = () => run.current === id;
    setStep({ at: "existing", phase: "pairing", uri: null });
    const wallet = walletFor("existing");
    try {
      const account = await wallet.connect({ onPairing: (uri) => live() && setStep({ at: "existing", phase: "pairing", uri }) });
      if (!live()) return;
      setStep({ at: "existing", phase: "signing", uri: null });
      const challenge = await createLinkChallenge();
      const signature = await wallet.signChallenge(account.accountId, challenge);
      if (!live()) return;
      setStep({ at: "existing", phase: "checking", uri: null });
      await verify({ ...account, door: "existing" }, signature, live);
    } catch (e) {
      if (!live()) return;
      const reason = e instanceof WalletError ? e.reason : "failed";
      setStep({ at: "existing", phase: reason === "rejected" ? "rejected" : reason === "timeout" ? "timeout" : "error", uri: null });
    }
  };

  const startEmbedded = async (method: "google" | "email", email?: string) => {
    const id = ++run.current;
    const live = () => run.current === id;
    setStep({ at: "embedded", phase: "creating" });
    const wallet = walletFor("embedded");
    try {
      const account = await wallet.connect({ method, email });
      const challenge = await createLinkChallenge();
      const signature = await wallet.signChallenge(account.accountId, challenge);
      if (!live()) return;
      await verify({ ...account, door: "embedded" }, signature, live);
    } catch (e) {
      if (live()) setStep({ at: "embedded", phase: e instanceof WalletError ? "failed" : "error" });
    }
  };

  const confirm = async (account: PendingLink) => {
    setStep({ at: "confirm", account, busy: true, failed: false });
    try {
      await confirmWalletLink();
      await refresh();
      setStep({ at: "done" });
    } catch {
      setStep({ at: "confirm", account, busy: false, failed: true });
    }
  };

  const restart = () => {
    run.current++;
    void cancelWalletLink();
    setStep({ at: "choose" });
  };

  const back =
    step.at === "existing" || step.at === "embedded" ? (
      <button type="button" onClick={restart} className={`${TEXT_LINK} inline-flex items-center gap-2 no-underline`}>
        <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
        {t.back}
      </button>
    ) : null;

  if (step.at === "choose") {
    return (
      <div className="flex flex-col gap-6">
        {link.data ? <p className="text-menu-fg/85 font-body text-body max-w-[44rem]">{t.replaces.replace("{account}", link.data.accountId)}</p> : null}
        {/* Linking a wallet they already own is what most players are here for (the team,
            2026-11-23), so HashPack leads and creating one is the quieter way in beside it. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.45fr_1fr] md:gap-8">
          <Door primary icon={Wallet} title={t.existing.title} body={t.existing.body} cta={t.existing.cta} onClick={() => void startExisting()} />
          <Door icon={Sparkles} title={t.embedded.title} body={t.embedded.body} cta={t.embedded.cta} onClick={() => setStep({ at: "embedded", phase: "choose" })} />
        </div>
        <PublicNote messages={messages} className="max-w-[40rem]" />
      </div>
    );
  }

  if (step.at === "existing") {
    const p = t.pairing;
    const stopped = step.phase === "rejected" || step.phase === "timeout" || step.phase === "error";
    return (
      <section className={PANEL}>
        {back}
        <h2 className="font-display text-menu-fg mt-6 text-[2rem] leading-none font-semibold tracking-[-0.03em] uppercase">{p.title}</h2>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
          {/* Desktop: the pairing code to scan. Phone: open HashPack on this phone. */}
          <figure className="hidden shrink-0 md:block">
            <div aria-label={p.code} role="img" className="bg-menu-fg grid size-56 place-items-center rounded-lg">
              <QrCode aria-hidden className={`text-ink size-44 ${step.phase === "pairing" ? "" : "opacity-25"}`} strokeWidth={1} />
            </div>
            <figcaption className={`${QUIET} mt-3 max-w-56`}>{p.scan}</figcaption>
          </figure>
          <div className="md:hidden">
            <p className="text-menu-fg/85 font-body text-body">{p.openBody}</p>
            <button type="button" className={`${OUTLINE_BUTTON} mt-4`} disabled={step.phase !== "pairing"}>
              {p.open}
            </button>
          </div>

          <div className="min-w-0 flex-1 md:pt-2">
            {step.phase === "pairing" ? <Busy>{p.waiting}</Busy> : null}
            {step.phase === "signing" ? <Busy>{p.signing}</Busy> : null}
            {step.phase === "checking" ? <Busy>{p.checking}</Busy> : null}
            {stopped ? (
              <>
                <Stopped>{step.phase === "rejected" ? p.rejected : step.phase === "timeout" ? p.timeout : messages.hedera.error}</Stopped>
                <button type="button" onClick={() => void startExisting()} className={`${OUTLINE_BUTTON} mt-5`}>
                  {messages.hedera.retry}
                </button>
              </>
            ) : null}
            <PublicNote messages={messages} className="mt-8 max-w-[30rem]" />
          </div>
        </div>
      </section>
    );
  }

  if (step.at === "embedded") {
    return (
      <section className={PANEL}>
        {back}
        <h2 className="font-display text-menu-fg mt-6 text-[2rem] leading-none font-semibold tracking-[-0.03em] uppercase">{t.create.title}</h2>
        <p className="text-menu-fg/85 font-body text-body mt-3 max-w-[36rem]">{t.create.body}</p>
        <div className="mt-8 max-w-[26rem]">
          {step.phase === "creating" ? (
            <Busy>{t.create.creating}</Busy>
          ) : (
            <>
              {step.phase === "failed" || step.phase === "error" ? (
                <Stopped className="mb-6">{step.phase === "failed" ? t.create.failed : messages.hedera.error}</Stopped>
              ) : null}
              <EmbeddedChoice messages={messages} onGoogle={() => void startEmbedded("google")} onEmail={(email) => void startEmbedded("email", email)} />
            </>
          )}
        </div>
        <PublicNote messages={messages} className="mt-10 max-w-[30rem]" />
      </section>
    );
  }

  if (step.at === "confirm") {
    const c = t.confirm;
    return (
      <section className={PANEL}>
        <h2 className="font-display text-menu-fg text-[2rem] leading-none font-semibold tracking-[-0.03em] uppercase">{c.title}</h2>
        <p className="text-menu-fg/85 font-body text-body mt-3 max-w-[36rem]">{c.body}</p>
        <dl className={`${TILE} mt-7 grid max-w-[36rem] grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-[1fr_auto]`}>
          <div>
            <dt className={QUIET}>{c.account}</dt>
            <dd className={`${FIGURE} mt-2 text-[2.25rem] tracking-[-0.02em] break-all`}>{step.account.accountId}</dd>
          </div>
          <div>
            <dt className={QUIET}>{c.wallet}</dt>
            <dd className="text-menu-fg font-body text-body mt-2">{step.account.provider}</dd>
          </div>
        </dl>
        <PublicNote messages={messages} className="mt-6 max-w-[36rem]" />
        {step.failed ? <Stopped className="mt-6">{messages.hedera.error}</Stopped> : null}
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
          <BracketButton onClick={() => void confirm(step.account)} disabled={step.busy} aria-busy={step.busy || undefined} className={CTA}>
            {c.yes}
          </BracketButton>
          <button type="button" onClick={restart} disabled={step.busy} className={TEXT_LINK}>
            {c.no}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={PANEL}>
      <CheckCircle2 aria-hidden className="text-gild size-12" strokeWidth={1.5} />
      <h2 className="font-display text-menu-fg mt-6 text-[2rem] leading-none font-semibold tracking-[-0.03em] uppercase">{t.done.title}</h2>
      <p className="text-menu-fg/85 font-body text-body mt-3 max-w-[36rem]">{t.done.body}</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
        <BracketButton href={next ?? `/${locale}/hedera/exclusives`} className={CTA}>
          {next ? t.done.continue : t.done.claim}
        </BracketButton>
        <Link href={`/${locale}/hedera/hub`} className={TEXT_LINK}>
          {t.done.hub}
        </Link>
      </div>
    </section>
  );
}

/**
 * One way in. The `primary` one (Connect HashPack) carries the red bracket
 * button and the gold mark; the other is quieter: an outline button and a
 * plain mark, so the two never read as equal choices.
 */
function Door({
  icon: Icon,
  title,
  body,
  cta,
  onClick,
  primary = false,
}: {
  icon: typeof Wallet;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <section className={cn(PANEL, "flex flex-col", !primary && "bg-pitch/60 border-menu-fg/12 border")}>
      <span className={cn("grid size-11 place-items-center rounded-sm", primary ? "bg-gild" : "border-menu-fg/35 border")}>
        <Icon aria-hidden className={cn("size-5.5", primary ? "text-ink" : "text-menu-fg")} strokeWidth={1.75} />
      </span>
      <h2
        className={cn(
          "font-display text-menu-fg mt-7 leading-none font-semibold tracking-[-0.03em] uppercase",
          primary ? "text-[2.25rem]" : "text-[1.5rem]",
        )}
      >
        {title}
      </h2>
      <p className={cn("font-body mt-3 flex-1", primary ? "text-menu-fg/85 text-body" : "text-menu-fg/70 text-body-sm")}>{body}</p>
      <div className="mt-8">
        {primary ? (
          <BracketButton onClick={onClick} className={CTA}>
            {cta}
          </BracketButton>
        ) : (
          <button type="button" onClick={onClick} className={OUTLINE_BUTTON}>
            {cta}
          </button>
        )}
      </div>
    </section>
  );
}

function EmbeddedChoice({ messages, onGoogle, onEmail }: { messages: Messages; onGoogle: () => void; onEmail: (email: string) => void }) {
  const t = messages.hedera.connect.create;
  const [email, setEmail] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) onEmail(email.trim());
  };

  return (
    <div className="flex flex-col gap-6">
      <BracketButton onClick={onGoogle} className={CTA}>
        {t.google}
      </BracketButton>
      <p className={`${QUIET} uppercase`}>{t.or}</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <AuthField
          label={t.emailLabel}
          type="email"
          autoComplete="email"
          required
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className={`${OUTLINE_BUTTON} self-start`}>
          {t.email}
        </button>
      </form>
    </div>
  );
}
