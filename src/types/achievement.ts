/**
 * Achievement contract. One of the EARN ACHIEVEMENTS cards: an emblem, a title,
 * the thing to do, and what it earns. Copy is keyed into
 * `messages.competition.achievements.items`, as every contract here does.
 */
export type Achievement = {
  slug: string;
  /** Key into `messages.competition.achievements.items` - title, requirement, reward. */
  copyKey: string;
  /** The delivered emblem, drawn at 1x. All four are 114 wide; heights differ. */
  badge: { src: string; width: number; height: number };
};
