import type { Locale } from "@/lib/utils/locales";

/**
 * A character, as the content team writes one in Decap
 * (`src/content/characters/<locale>/<slug>.md`, read by
 * `src/lib/api/characters.ts`). The copy is inside the entry, one file per
 * locale; the pictures, the group and the order are the same in both.
 *
 * How each picture is cropped into a card, a tile, a plate or the hero is NOT
 * here: that is solved per picture file and lives in `src/lib/characters.ts`,
 * keyed by the file.
 */

/** The roster's three groups, in the order the page draws them. */
export const CHARACTER_GROUPS = ["champions", "gods", "legends"] as const;
export type CharacterGroup = (typeof CHARACTER_GROUPS)[number];

export type Ability = { name: string; text: string };

/** A core ability and its own action shot, the picture on its tile. */
export type CoreAbility = Ability & { image: string };

export type Character = {
  slug: string;
  locale: Locale;
  name: string;
  /** The alias under the name, e.g. The Nightlit Fugitive. */
  role?: string;
  group: CharacterGroup;
  /** Position within the group. Lower comes first. */
  order: number;
  /** The roster card, the modal and the detail hero. */
  image: string;
  alt: string;
  /** The card's modal, in paragraphs. Empty for anyone Content has not written yet. */
  bio: readonly string[];
  /** The hero's two glyph tiles. */
  weapon?: string;
  chi?: string;
  /** Beside the portrait on the detail page, in paragraphs. */
  intro: readonly string[];
  lore: readonly string[];
  abilities: readonly CoreAbility[];
  /** Nze's two forms. Empty for everyone else, and the section with it. */
  variants: readonly Ability[];
  /** The detail page's plates, in order. */
  gallery: readonly string[];
};
