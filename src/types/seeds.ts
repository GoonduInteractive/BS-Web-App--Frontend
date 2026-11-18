/**
 * Seeds: the community points a player earns by reading comics, sharing them,
 * bringing friends and playing, and spends on store discounts.
 */

/** A player's Seeds. */
export type SeedsBalance = {
  /** What they can spend now: the Calabash, capped at 20,000. */
  calabash: number;
  /** Everything they have ever earned: the Legacy, never reduced by spending. */
  legacy: number;
  /** Earned but on hold, not spendable yet. */
  pending: number;
};

/** A store discount Seeds buy. */
export type RewardTier = {
  /** As the API names it. */
  name: string;
  /** Percent off. */
  discountPct: number;
  /** What it costs, in Seeds. */
  cost: number;
  /** The most it takes off one order, in naira. */
  capNaira: number;
};

/** A discount code bought with Seeds. Single use: one order. */
export type RewardCode = {
  id: string;
  code: string;
  discountPct: number;
  /** What it cost, in Seeds. */
  cost: number;
  /** Not used yet, and not expired or withdrawn. */
  usable: boolean;
  usedAt?: string;
  createdAt: string;
};

/** Something the API tells the signed-in player. */
export type PlayerNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  sentAt: string;
  /** Where it leads, if anywhere: a path on this site or a full address. */
  href?: string;
};
