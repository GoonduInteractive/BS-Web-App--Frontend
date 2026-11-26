"use client";

import { useState } from "react";

import { AssetArt, Busy, HashscanLink, Stopped } from "@/components/hedera/bits";
import { BracketButton } from "@/components/ui/BracketButton";
import { TornDialog } from "@/components/ui/TornDialog";
import { useClaim, useHoldings, useRefreshHedera, useWalletLink } from "@/hooks/useHedera";
import { requestClaim } from "@/lib/api/hedera";
import type { Messages } from "@/lib/utils/messages";
import { WalletError, walletFor } from "@/lib/wallet";
import type { HederaAsset } from "@/types/hedera";

type Phase = "intro" | "associate" | "associating" | "rejected" | "sending" | "failed";

/**
 * Claiming a free exclusive (the doc's screen 10, flow C), on the paper sheet
 * SHARE YOUR THOUGHTS uses: claim; approve the collection in HashPack if the
 * wallet hasn't (an embedded wallet associates by itself); then the mint
 * queue, watched until it's confirmed or failed, with a retry.
 */
export function ClaimDialog({
  asset,
  open,
  onClose,
  messages,
}: {
  asset: HederaAsset;
  open: boolean;
  onClose: () => void;
  messages: Messages;
}) {
  const t = messages.hedera.claim;
  const link = useWalletLink();
  const holdings = useHoldings();
  const refresh = useRefreshHedera();
  const [phase, setPhase] = useState<Phase>("intro");
  const [claimId, setClaimId] = useState<string | null>(null);
  const job = useClaim(claimId);
  const wallet = link.data;

  // The mint's own word decides once it's under way.
  const mint = phase === "sending" && claimId ? job.data?.status : undefined;
  const done = mint === "confirmed";
  const failed = phase === "failed" || mint === "failed";

  const send = async () => {
    setClaimId(null);
    setPhase("sending");
    try {
      setClaimId((await requestClaim(asset.id)).id);
      void refresh();
    } catch {
      setPhase("failed");
    }
  };

  // Whether the wallet has the collection is the holdings' to say: a CLAIM pressed before they
  // arrive waits for them, rather than asking for an approval the wallet already gave.
  const [checking, setChecking] = useState(false);
  const claim = async () => {
    if (!wallet || checking) return;
    setChecking(true);
    const current = holdings.data ?? (await holdings.refetch()).data;
    setChecking(false);
    const associated = current ? current.associated.includes(asset.tokenId) : wallet.autoAssociation;
    if (associated) void send();
    else setPhase("associate");
  };

  const associate = async () => {
    if (!wallet) return;
    setPhase("associating");
    try {
      await walletFor(wallet.door).associate(wallet.accountId, asset.tokenId);
      await send();
    } catch (e) {
      setPhase(e instanceof WalletError && e.reason === "rejected" ? "rejected" : "failed");
    }
  };

  const close = () => {
    onClose();
    setPhase("intro");
    setClaimId(null);
    void refresh();
  };

  const title = "font-display text-ink text-section-heading font-semibold tracking-[-0.058em] uppercase";
  const body = "text-ash font-body text-body mt-3";

  return (
    <TornDialog
      open={open}
      onClose={close}
      label={t.label}
      closeLabel={t.close}
      maxWidthClassName="max-w-[42rem]"
      className="px-6 pt-16 pb-14 text-center sm:px-20 sm:pt-[4.5rem] sm:pb-20"
    >
      <AssetArt asset={asset} sizes="160px" className="mx-auto max-w-40" />

      {done ? (
        <>
          <h2 className={`${title} mt-8`}>{t.doneTitle}</h2>
          <p className={body}>{t.doneBody.replace("{name}", asset.name)}</p>
          {job.data?.txId ? (
            <HashscanLink kind="transaction" value={job.data.txId} label={messages.hedera.viewOnHashscan} tone="light" className="mt-5" />
          ) : null}
          <div className="mt-8 flex justify-center">
            <BracketButton tone="ink" field="light" onClick={close} className="px-4.75 py-4.75 leading-none tracking-normal">
              {t.done}
            </BracketButton>
          </div>
        </>
      ) : phase === "associate" || phase === "associating" || phase === "rejected" ? (
        <>
          <h2 className={`${title} mt-8`}>{t.associateTitle}</h2>
          <p className={body}>{t.associateBody.replace("{family}", messages.hedera.families[asset.family].toLowerCase())}</p>
          <div className="mt-8 flex flex-col items-center gap-5">
            {phase === "associating" ? (
              <Busy tone="light">{t.associating}</Busy>
            ) : (
              <BracketButton tone="ink" field="light" onClick={() => void associate()} className="px-4.75 py-4.75 leading-none tracking-normal">
                {phase === "rejected" ? messages.hedera.retry : t.associate}
              </BracketButton>
            )}
            {phase === "rejected" ? <Stopped>{t.rejected}</Stopped> : null}
          </div>
        </>
      ) : (
        <>
          <h2 className={`${title} mt-8`}>{t.title.replace("{name}", asset.name)}</h2>
          <p className={body}>{t.intro.replace("{account}", wallet?.accountId ?? "")}</p>
          <div className="mt-8 flex flex-col items-center gap-5">
            {phase === "sending" && !failed ? (
              <Busy tone="light">{t.minting}</Busy>
            ) : (
              <BracketButton
                tone="ink"
                field="light"
                onClick={failed ? () => void send() : () => void claim()}
                disabled={!wallet || checking}
                aria-busy={checking || undefined}
                className="px-4.75 py-4.75 leading-none tracking-normal"
              >
                {failed ? messages.hedera.retry : t.go}
              </BracketButton>
            )}
            {failed ? <Stopped>{t.failed}</Stopped> : null}
          </div>
        </>
      )}
    </TornDialog>
  );
}
