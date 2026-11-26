import type { FiatPrice, HederaAsset, HederaPrize, TournamentPrizeType } from "@/types/hedera";

/**
 * THE MOCK'S FIXED DATA - NOT REAL, and only ever read while the Hedera
 * section runs on mocks (`lib/hedera/mode.ts`). Safe on the server: no
 * browser storage here, so the store's public pages are still built static.
 *
 * The exclusives are drawn from the cast the site already shows, with the
 * character art already in `public/assets/characters`; their names, prices
 * and editions are invented to exercise every state the doc asks for (on
 * sale, limited, limited time, sold out, free on wallet link). Leslie's asset
 * management doc replaces them.
 */

/** One collection per asset family (the doc), on testnet. */
export const MOCK_COLLECTIONS = { skin: "0.0.5104201", weapon: "0.0.5104202", character: "0.0.5104203" } as const;

/** Goondu's receiving account for HBAR payments. */
export const MOCK_TREASURY = "0.0.5104100";

/** A fixed rate for the quotes. Live, the gateway quotes and the quote expires. */
export const MOCK_RATE = { NGN: 260, USD: 0.18 } as const;

/** The quote in HBAR for a store price, to two places. */
export function quoteHbar(price: FiatPrice): number {
  return Math.round((price.amount / MOCK_RATE[price.currency]) * 100) / 100;
}

const GAME = "Beyond Service: Trial of the Gods";

export const MOCK_CATALOGUE: readonly HederaAsset[] = [
  {
    id: "bs-skin-soma-ember",
    name: "Soma: Ember Robes",
    description: "Soma's robes, dyed in the colour of the shrine fires. A look for the arena, nothing more: it changes no stat.",
    family: "skin",
    rarity: "epic",
    image: "/assets/characters/02_Soma_3D.png",
    imageAlt: "Soma in the Ember Robes skin",
    games: [GAME],
    access: "sale",
    price: { amount: 4500, currency: "NGN" },
    supply: null,
    saleEndsAt: null,
    tokenId: MOCK_COLLECTIONS.skin,
  },
  {
    id: "bs-skin-kaira-nightveil",
    name: "Kaira: Nightveil",
    description: "Kaira, veiled for the night hunt. A limited edition of 500.",
    family: "skin",
    rarity: "legendary",
    image: "/assets/characters/Pose_01_Kaira_3D.png",
    imageAlt: "Kaira in the Nightveil skin",
    games: [GAME],
    access: "sale",
    price: { amount: 9000, currency: "NGN" },
    supply: { total: 500, remaining: 132 },
    saleEndsAt: null,
    tokenId: MOCK_COLLECTIONS.skin,
  },
  {
    id: "bs-skin-nze-harvest",
    name: "Nze Ugwuoke: Harvest Garb",
    description: "The elder's garb from the new yam festival, on sale for a short time.",
    family: "skin",
    rarity: "rare",
    image: "/assets/characters/nze.png",
    imageAlt: "Nze Ugwuoke in the Harvest Garb skin",
    games: [GAME],
    access: "sale",
    price: { amount: 3500, currency: "NGN" },
    supply: null,
    saleEndsAt: "2026-12-05T22:59:00.000Z",
    tokenId: MOCK_COLLECTIONS.skin,
  },
  {
    id: "bs-weapon-twinfang",
    name: "Twinfang",
    description: "Omalicha's pistol and blade, finished in black iron.",
    family: "weapon",
    rarity: "rare",
    image: "/assets/characters/Pose_02_Omalicha_Normal_Gun_Knife_3D.jpg",
    imageAlt: "Omalicha holding the Twinfang pistol and blade",
    games: [GAME],
    access: "sale",
    price: { amount: 3000, currency: "NGN" },
    supply: null,
    saleEndsAt: null,
    tokenId: MOCK_COLLECTIONS.weapon,
  },
  {
    id: "bs-character-the-beast",
    name: "The Beast",
    description: "The Beast, as a character in the arena. Like every exclusive, it gives no advantage in a match.",
    family: "character",
    rarity: "epic",
    image: "/assets/characters/The-Beast.png",
    imageAlt: "The Beast",
    games: [GAME],
    access: "sale",
    price: { amount: 7500, currency: "NGN" },
    supply: null,
    saleEndsAt: null,
    tokenId: MOCK_COLLECTIONS.character,
  },
  {
    id: "bs-character-ogbunabali",
    name: "Ogbun'abali",
    description: "The god of the night, as a character in the arena. A limited edition of 250, with no advantage in a match.",
    family: "character",
    rarity: "legendary",
    image: "/assets/characters/ogbunabali.png",
    imageAlt: "Ogbun'abali",
    games: [GAME],
    access: "sale",
    price: { amount: 12000, currency: "NGN" },
    supply: { total: 250, remaining: 0 },
    saleEndsAt: null,
    tokenId: MOCK_COLLECTIONS.character,
  },
  {
    id: "bs-skin-soma-first-light",
    name: "Soma: First Light",
    description: "Free to every player who links a Hedera wallet.",
    family: "skin",
    rarity: "common",
    image: "/assets/characters/01_Soma_3D.png",
    imageAlt: "Soma in the First Light skin",
    games: [GAME],
    access: "free",
    price: null,
    supply: null,
    saleEndsAt: null,
    tokenId: MOCK_COLLECTIONS.skin,
  },
  {
    id: "bs-weapon-founders-staff",
    name: "Founder's Staff",
    description: "Nze's staff from the founding of the shrine. Free to every player who links a Hedera wallet.",
    family: "weapon",
    rarity: "common",
    image: "/assets/characters/01_Nze_3D.png",
    imageAlt: "Nze Ugwuoke holding the Founder's Staff",
    games: [GAME],
    access: "free",
    price: null,
    supply: null,
    saleEndsAt: null,
    tokenId: MOCK_COLLECTIONS.weapon,
  },
];

/**
 * Prizes the mock player has won: one waiting for their identity check, one
 * the team sent back, one below the threshold waiting for approval, one paid.
 */
export const MOCK_PRIZES: readonly HederaPrize[] = [
  {
    id: "prz-eastern-cup-2",
    tournament: "Eastern Province Cup",
    tournamentSlug: "eastern-province-cup",
    region: "Enugu",
    startedAt: "2026-11-08T15:00:00.000Z",
    endedAt: "2026-11-16T18:00:00.000Z",
    players: 64,
    place: 2,
    hbar: 1500,
    needsIdentity: true,
    status: "verify",
    txId: null,
    updatedAt: "2026-11-16T18:20:00.000Z",
  },
  {
    id: "prz-rivers-masters-1",
    tournament: "Rivers Masters",
    tournamentSlug: "rivers-masters",
    region: "Rivers",
    startedAt: "2026-11-01T15:00:00.000Z",
    endedAt: "2026-11-09T19:30:00.000Z",
    players: 32,
    place: 1,
    hbar: 4000,
    needsIdentity: true,
    status: "resubmit",
    identityNote: "The name on the ID doesn't match the name on your account. Send it again with the ID in your account's name.",
    txId: null,
    updatedAt: "2026-11-12T10:45:00.000Z",
  },
  {
    id: "prz-lagos-weekly-5",
    tournament: "Lagos Weekly Clash",
    tournamentSlug: "lagos-weekly-clash",
    region: "Lagos",
    startedAt: "2026-11-15T16:00:00.000Z",
    endedAt: "2026-11-17T20:00:00.000Z",
    players: 128,
    place: 5,
    hbar: 200,
    needsIdentity: false,
    status: "pending",
    txId: null,
    updatedAt: "2026-11-17T20:05:00.000Z",
  },
  {
    id: "prz-abuja-open-3",
    tournament: "Abuja Open",
    tournamentSlug: "abuja-open",
    region: "Abuja",
    startedAt: "2026-11-06T15:00:00.000Z",
    endedAt: "2026-11-14T17:00:00.000Z",
    players: 48,
    place: 3,
    hbar: 450,
    needsIdentity: false,
    status: "sent",
    txId: "0.0.5104100@1763140200.118204512",
    updatedAt: "2026-11-14T17:10:00.000Z",
  },
];

/**
 * Percent off a merch order paid in HBAR rather than by card or bank. The
 * admin sets it on Treasury (2.5% to start: ₦20,000 by card, ₦19,500 in HBAR).
 */
export const MOCK_HBAR_DISCOUNT_PCT = 2.5;

/** HBAR per place on a tournament that pays in HBAR. */
export const MOCK_HBAR_PRIZES = [5000, 2500, 1000] as const;

/**
 * How a tournament pays. The API doesn't say yet, so the mock decides from the
 * slug - the same answer every build - and some live tournaments show HBAR.
 */
export function mockPrizeType(slug: string): TournamentPrizeType {
  let hash = 0;
  for (const c of slug) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return (["cash", "hbar", "both"] as const)[hash % 3];
}
