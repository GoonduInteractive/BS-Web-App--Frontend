import type { WalletDoor } from "@/types/hedera";

/**
 * A wallet, as the website uses one (the doc: wallet signatures happen only in
 * the browser; the player connects once, then signs only when HBAR leaves).
 * Two doors: an existing Hedera wallet through Hedera Wallet Connect
 * (HashPack), or an embedded wallet created with Google or email.
 *
 * Only the mock implements it today (`mock.ts`). The real HashPack connector
 * (`@hashgraph/hedera-wallet-connect`, which needs a WalletConnect project ID)
 * and the embedded provider Sophia picks become two more implementations;
 * the screens don't change.
 */
export type ConnectOptions = {
  /** Embedded wallets: how the player signs in to the provider. */
  method?: "google" | "email";
  email?: string;
  /** Existing wallets: the pairing URI to draw as a QR code, or open as a deep link. */
  onPairing?: (uri: string) => void;
};

export type ConnectedAccount = { accountId: string; provider: string; autoAssociation: boolean };

export interface WalletConnector {
  door: WalletDoor;
  /** Pair with (existing) or create (embedded) the wallet; the account it controls. */
  connect(options: ConnectOptions): Promise<ConnectedAccount>;
  /** Sign the backend's one-time link challenge. */
  signChallenge(accountId: string, challenge: string): Promise<string>;
  /** Associate a collection, so the wallet can receive its NFTs. */
  associate(accountId: string, tokenId: string): Promise<void>;
  /** Send HBAR with the order's memo; the transaction ID. */
  pay(accountId: string, payment: { to: string; hbar: number; memo: string }): Promise<string>;
}

/** Why a wallet step stopped: the player said no, nothing answered in time, or it broke. */
export type WalletFailure = "rejected" | "timeout" | "failed";

export class WalletError extends Error {
  constructor(public readonly reason: WalletFailure) {
    super(`Wallet step ${reason}`);
    this.name = "WalletError";
  }
}
