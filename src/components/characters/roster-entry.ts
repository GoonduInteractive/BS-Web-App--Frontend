import type { RosterEntry } from "@/components/characters/CharacterModal";
import { characterHref, figureClass, portraitFraming } from "@/lib/characters";
import type { Character } from "@/types/character";

/**
 * A character as the roster card and its modal want it: the copy, the
 * portrait with the crop solved for that file, and the link to the detail
 * page. The roster grid, SOULS OF THE ARENA on The Game page and the detail
 * page's OTHER CHAMPIONS row all draw the same card from this.
 */
export function rosterEntry(character: Character, locale: string): RosterEntry {
  return {
    name: character.name,
    role: character.role,
    alt: character.alt,
    image: character.image,
    portraitClass: portraitFraming(character.image),
    figureClass: figureClass(character.image),
    bio: character.bio.length ? [...character.bio] : undefined,
    href: characterHref(locale, character.slug),
  };
}
