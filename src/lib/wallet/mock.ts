import { mockSignature, recordAssociation, recordPayment, scenario } from "@/lib/api/hedera-mock";
import type { WalletDoor } from "@/types/hedera";

import { WalletError, type WalletConnector } from "./types";

/**
 * MOCK WALLETS - no HashPack, no provider, no chain. They take about as long
 * as the real steps do and fail the way `?mock=` asks (`hedera-mock.ts`):
 * `timeout` (HashPack never answers the pairing), `rejected` (the player
 * declines to sign, associate or pay), `createfail` (the embedded wallet
 * can't be made).
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const account = (prefix: string) => `${prefix}${Math.floor(100 + Math.random() * 900)}`;

export function mockWallet(door: WalletDoor): WalletConnector {
  return {
    door,

    async connect({ method, onPairing }) {
      if (door === "existing") {
        onPairing?.(`wc:mock${Date.now().toString(16)}@2?relay-protocol=irn&symKey=mock`);
        await wait(3_000);
        if (scenario() === "timeout") throw new WalletError("timeout");
        return { accountId: account("0.0.4817"), provider: "HashPack", autoAssociation: false };
      }
      await wait(2_200);
      if (scenario() === "createfail") throw new WalletError("failed");
      return { accountId: account("0.0.6129"), provider: method === "email" ? "Email" : "Google", autoAssociation: true };
    },

    async signChallenge(_accountId, challenge) {
      // An embedded wallet signs for the player at once; HashPack asks them.
      await wait(door === "existing" ? 2_000 : 600);
      if (door === "existing" && scenario() === "rejected") throw new WalletError("rejected");
      return mockSignature(challenge);
    },

    async associate(accountId, tokenId) {
      await wait(1_800);
      if (scenario() === "rejected") throw new WalletError("rejected");
      recordAssociation(accountId, tokenId);
    },

    async pay(accountId, { hbar, memo }) {
      await wait(2_000);
      if (scenario() === "rejected") throw new WalletError("rejected");
      return recordPayment(accountId, memo, hbar);
    },
  };
}
