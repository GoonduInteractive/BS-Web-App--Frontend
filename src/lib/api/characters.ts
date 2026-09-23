import { cache } from "react";

import { readEntries, type Entry } from "@/lib/content";
import { characterFrontmatter, type CharacterFrontmatter } from "@/lib/schemas/character";
import { DEFAULT_LOCALE, type Locale } from "@/lib/utils/locales";
import { splitBlocks } from "@/lib/utils/markdown";
import { CHARACTER_GROUPS, type Character } from "@/types/character";

/**
 * The characters, from the CMS.
 *
 * `src/content/characters/<locale>/<slug>.md`, read through `lib/content.ts`
 * with the English underneath the Igbo, checked against
 * `lib/schemas/character.ts`. Characters switched off in the editor are left
 * out here - no card, no modal, no detail page (the route 404s), no sitemap
 * line, no place in OTHER CHAMPIONS - which is what commenting an entry out of
 * the old manifest used to do. The order is the roster's: champions, then
 * gods, then legends, and within a group the editor's `order`, then the name.
 *
 * The paragraph fields (bio, intro, lore) arrive as one text with blank lines
 * between paragraphs and leave here as the arrays the components draw.
 */

const COLLECTION = "characters";

export class CharacterNotFoundError extends Error {
  constructor(slug: string) {
    super(`No character for slug "${slug}"`);
    this.name = "CharacterNotFoundError";
  }
}

const paragraphs = (text: string | undefined): readonly string[] => (text ? splitBlocks(text) : []);

function toCharacter(locale: Locale, { slug, data }: Entry<CharacterFrontmatter>): Character {
  return {
    slug,
    locale,
    name: data.name,
    role: data.role,
    group: data.group,
    order: data.order,
    image: data.image,
    alt: data.alt,
    bio: paragraphs(data.bio),
    weapon: data.weapon,
    chi: data.chi,
    intro: paragraphs(data.intro),
    lore: paragraphs(data.lore),
    abilities: data.abilities,
    variants: data.variants,
    // Without a delivered pose the portrait stands in, as the old manifest did
    // for anyone whose action art had not arrived.
    action: data.action ?? data.image,
    gallery: data.gallery.length ? data.gallery : [data.image],
  };
}

const readList = cache((locale: Locale): readonly Character[] =>
  readEntries(COLLECTION, locale, characterFrontmatter)
    .filter((entry) => entry.data.visible)
    .map((entry) => toCharacter(locale, entry))
    .sort(
      (a, b) =>
        CHARACTER_GROUPS.indexOf(a.group) - CHARACTER_GROUPS.indexOf(b.group) ||
        a.order - b.order ||
        a.name.localeCompare(b.name),
    ),
);

/** Everyone on the roster, in roster order. */
export async function getCharacters(locale: Locale): Promise<readonly Character[]> {
  return readList(locale);
}

/** The slugs that have a page - the visible characters, from the English files. */
export function getCharacterSlugs(): readonly string[] {
  return readList(DEFAULT_LOCALE).map((c) => c.slug);
}

export async function getCharacter(locale: Locale, slug: string): Promise<Character> {
  const character = readList(locale).find((c) => c.slug === slug);
  if (!character) throw new CharacterNotFoundError(slug);
  return character;
}

/** Everyone but the one being looked at, for the OTHER CHAMPIONS row. */
export async function getOtherCharacters(locale: Locale, slug: string): Promise<readonly Character[]> {
  return readList(locale).filter((c) => c.slug !== slug);
}
