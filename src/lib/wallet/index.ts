import { HEDERA_MODE } from "@/lib/hedera/mode";
import type { WalletDoor } from "@/types/hedera";

import { mockWallet } from "./mock";
import type { WalletConnector } from "./types";

export { WalletError, type WalletConnector, type WalletFailure } from "./types";

/**
 * The wallet behind a door. Mock only, for now: the real HashPack connector
 * and the embedded provider aren't chosen or wired (the doc's open questions).
 */
export function walletFor(door: WalletDoor): WalletConnector {
  if (HEDERA_MODE !== "mock") throw new Error("No wallet connector is wired outside mock mode yet");
  return mockWallet(door);
}
