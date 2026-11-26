/**
 * Whether the Hedera section runs, and on what.
 *
 * THE HEDERA APIS DON'T EXIST YET (Sophia's "Hedera on the Website (v2
 * Scope)", 2026-11-09; nothing in the API spec as of 2026-11-18), so the
 * section runs on mock data behind `NEXT_PUBLIC_HEDERA_MOCK=1`, set in a
 * developer's `.env` only. Unset - production, and any branch this merges
 * into - the section is OFF: every Hedera route is the Coming Soon page
 * (`lib/hidden-sections.ts`) and the profile, checkout and tournament pages
 * show none of their Hedera parts. Fake HBAR can't reach a player.
 *
 * When the endpoints land this gains "live", and the adapters in
 * `lib/api/hedera.ts` stop calling the mock.
 */
export type HederaMode = "mock" | "off";

export const HEDERA_MODE: HederaMode = process.env.NEXT_PUBLIC_HEDERA_MOCK === "1" ? "mock" : "off";

export const HEDERA_ON = HEDERA_MODE !== "off";

/** The network the section reads and links on. Mainnet once the APIs are live. */
export const HEDERA_NETWORK = "testnet" as const;
