/**
 * STAND-IN ART FOR THE HEDERA SCREENS, until Sophia's images arrive (the
 * team, 2026-11-23: "high-quality JPEGs featuring game characters
 * interacting with the Hedera logo, for use across all Hedera-related
 * screens"). The human asked for images in the spaces meanwhile
 * (2026-11-23), so each screen borrows a character render the site already
 * ships - cut-outs on transparent ground - and `HederaArt` sets it on a glow
 * with HBAR's mark and the Hedera logo beside it, as the real art will.
 *
 * REPLACING THEM: drop the delivered files in `public/assets/hedera/` and
 * point each entry here at its own. Nothing else changes. Decorative
 * throughout (the page says what it is), so there's no alt text to write.
 *
 * `position` frames each render: where its head and shoulders sit in the file.
 * `delivered` marks the real art: it carries the Hedera mark itself, so
 * `HederaArt` adds no stand-in badges, and `heroFit` says how it fills the
 * explainer's hero.
 */
export type HederaArtKey = "explainer" | "hub" | "store" | "exclusives" | "activity" | "connect" | "checkout" | "order" | "prize" | "orderItem";

export type HederaArtImage = { src: string; position: string; delivered?: boolean; heroFit?: string };

export const HEDERA_ART: Record<HederaArtKey, HederaArtImage> = {
  // DELIVERED (2026-11-26): Soma sitting on the Hedera "H". 1672 x 941 on a transparent
  // ground with empty sides, so it covers the hero's tall box from the bottom, its sides
  // (only transparency) cropped, rather than shrinking to fit the full width.
  explainer: {
    src: "/assets/hedera/hedera-hero.png",
    position: "object-[50%_0%]",
    delivered: true,
    heroFit: "object-cover object-bottom",
  },
  hub: { src: "/assets/characters/Nze-Ugwuoke.png", position: "object-[50%_8%]" },
  store: { src: "/assets/characters/The-Beast.png", position: "object-[50%_6%]" },
  exclusives: { src: "/assets/characters/kaira-full-3d.png", position: "object-[50%_4%]" },
  activity: { src: "/assets/characters/Ogbuagu.png", position: "object-[50%_8%]" },
  connect: { src: "/assets/characters/Lieutenant.png", position: "object-[50%_6%]" },
  checkout: { src: "/assets/characters/ogbunabali.png", position: "object-[50%_10%]" },
  order: { src: "/assets/characters/Nze-Ugwuoke.png", position: "object-[50%_8%]" },
  prize: { src: "/assets/characters/The-Beast.png", position: "object-[50%_6%]" },
  /** The HBAR checkout's ITEM for a merch order, which has no picture of its own. */
  orderItem: { src: "/assets/characters/kaira-crop.png", position: "object-[50%_0%]" },
};
