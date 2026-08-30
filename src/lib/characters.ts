import type { Messages } from "@/lib/utils/messages";

/**
 * The roster manifest — which characters exist, what they are called in the
 * message files, which group they belong to, and which artwork each one uses.
 *
 * COPY LIVES IN `src/messages`, NOT HERE. This file holds slugs, grouping and
 * asset paths: the things that are the same in English and Igbo. `castKey` is
 * the join between the two.
 *
 * The order is the frame's — champions, then gods, then legends — and it is what
 * both the roster grid and the detail page's OTHER CHAMPIONS row read.
 */

export type CharacterGroup = "champions" | "gods" | "legends";

export type Character = {
  /** URL segment. English, per the naming rule for routes. */
  slug: string;
  /** Key into `messages.characters.roster.cast`. */
  castKey: keyof Messages["characters"]["roster"]["cast"];
  group: CharacterGroup;
  /** The roster card portrait, and the detail hero's figure. */
  image: string;
  /**
   * Framing override for the card portrait, as literal Tailwind classes.
   * Only the three the frame hand-places carry one. See CharacterCard.
   */
  portraitClass?: string;
  /**
   * The action shot the detail page uses for ability thumbnails and the gallery.
   *
   * FLAGGED: only Soma has one — `soma-nysc.png` is the pose the frame repeats
   * across every ability tile and all three gallery slots. Everyone else falls
   * back to their own portrait, which is a stand-in the human asked for
   * explicitly and expects to replace.
   */
  action: string;
  /**
   * Framing for the action shot — one class per box, because the two boxes have
   * different aspects and a single zoom cannot serve both.
   *
   * ONLY ONE ASSET NEEDS THESE, and that is a measurement rather than a guess.
   * Reading each file's alpha bounds against its own canvas, every portrait
   * fills 88 to 100% of at least one axis — except `soma-nysc.png`, whose figure
   * occupies 55% x 67% of a 4096 square and sits off-centre at 55.6%, 58.3%.
   * Dropped into a 144 x 130 tile with plain `object-cover` it rendered as an
   * empty box with a speck in it.
   */
  actionTileClass?: string;
  actionGalleryClass?: string;
};

/**
 * soma-nysc.png in the 144 x 130 ability tile and the 336 x 453 gallery plate.
 *
 * BOTH ARE COVER, and only one of them needs a zoom. `object-cover` fits the
 * square canvas to each box's larger axis. In the tall gallery plate that
 * already lands the figure at the frame's size, so it takes no scale at all — an
 * earlier 1.27 there cropped his head. The short tile needs 1.12 to reach the
 * frame.
 *
 * The translates put his off-centre figure back in the middle of each box: he
 * sits 5.6% right and 8.3% low in his own canvas, and what that is worth in
 * pixels differs per box, which is why the two corrections differ.
 *
 * `scale` and `translate` are separate CSS properties in Tailwind v4, so both
 * survive on one element — but neither survives GSAP touching it, which is why
 * the gallery tweens a wrapper. See DetailBody's scene, note 3.
 *
 * FLAGGED: the frame's tiles show this figure on a dark blue-grey backdrop, but
 * the delivered file is a cutout with 45% of its canvas transparent. The plate
 * colour is a CSS fill here rather than part of the art. What this really wants
 * is a cropped action export per character; these numbers exist because there
 * is exactly one action asset and it is framed for something else.
 */
const SOMA_TILE = "object-cover scale-[1.12] -translate-x-[6.7%] -translate-y-[13%]";
const SOMA_GALLERY = "object-cover object-[55.6%_50%] -translate-y-[8%]";

/**
 * Framing for the two portraits the frame hand-places.
 *
 * KAIRA HAD ONE AND NO LONGER DOES, and that was a real bug rather than a
 * preference. Her numbers were solved against `kaira-crop.png` — 636 x 795, a
 * tight crop — and the card later moved to `kaira-full.png`, which is 1600 x
 * 1600 with the figure filling 100% x 91% of it. Framing solved for one file
 * applied to another shrank her to 78% of the card and left her floating in
 * field while every other card filled, which is exactly what it looked like.
 *
 * A framing constant is only ever valid for the file it was measured on. Kaira's
 * new file fills its own canvas like the six legends assets do, so she takes
 * plain `object-cover` with them and needs no override at all.
 */
const SOMA_FRAME = "w-[119.02%] left-[-10.24%] top-0";
const OGBUN_FRAME = "w-[127.32%] left-[-11.22%] top-[-6.34%]";

export const CHARACTERS: Character[] = [
  {
    slug: "soma",
    castKey: "soma",
    group: "champions",
    image: "/assets/characters/soma-gate-character.png",
    portraitClass: SOMA_FRAME,
    action: "/assets/characters/soma-nysc.png",
    actionTileClass: SOMA_TILE,
    actionGalleryClass: SOMA_GALLERY,
  },
  {
    slug: "kaira",
    castKey: "kaira",
    group: "champions",
    image: "/assets/characters/kaira-full.png",
    action: "/assets/characters/kaira-full.png",
  },
  {
    slug: "ogbunabali",
    castKey: "ogbunabali",
    group: "gods",
    image: "/assets/characters/ogbunabali.png",
    portraitClass: OGBUN_FRAME,
    action: "/assets/characters/ogbunabali.png",
  },
  {
    slug: "nze-ugwuoke",
    castKey: "nzeUgwuoke",
    group: "legends",
    image: "/assets/characters/Nze-Ugwuoke.png",
    action: "/assets/characters/Nze-Ugwuoke.png",
  },
  {
    slug: "lieutenant",
    castKey: "lieutenant",
    group: "legends",
    image: "/assets/characters/Lieutenant.png",
    action: "/assets/characters/Lieutenant.png",
  },
  {
    slug: "the-beast",
    castKey: "theBeast",
    group: "legends",
    image: "/assets/characters/The-Beast.png",
    action: "/assets/characters/The-Beast.png",
  },
  {
    slug: "oji-isi",
    castKey: "ojiIsi",
    group: "legends",
    image: "/assets/characters/Oji-isi.png",
    action: "/assets/characters/Oji-isi.png",
  },
  {
    slug: "ogbuagu",
    castKey: "ogbuagu",
    group: "legends",
    image: "/assets/characters/Ogbuagu.png",
    action: "/assets/characters/Ogbuagu.png",
  },
  {
    // MKPUME HAS NO ARTWORK OF ITS OWN. The Figma frame draws it with the
    // Ogbuagu render and the human confirmed reusing that file. A stand-in,
    // knowingly; when its own art lands, these two lines change.
    slug: "mkpume",
    castKey: "mkpume",
    group: "legends",
    image: "/assets/characters/Ogbuagu.png",
    action: "/assets/characters/Ogbuagu.png",
  },
];

/**
 * One character's copy, as the components want it.
 *
 * WHY THIS TYPE EXISTS. `Messages` is inferred from `en.json`, so the nine cast
 * entries infer as a UNION of nine slightly different shapes — Oji Isi has no
 * `role`, three have no `bio` — and TypeScript will not read `role` off a union
 * where one member lacks it. Declaring the shape once, with the genuinely
 * optional fields marked optional, is what lets every consumer read a character
 * without narrowing on which one it is.
 */
export type CastCopy = {
  name: string;
  role?: string;
  alt: string;
  bio?: string[];
  detail: {
    stats: { role: string; difficulty: string };
    intro: string[];
    lore: string[];
    abilities: { name: string; text: string }[];
    variants: { name: string; text: string }[];
  };
};

/** The single place the union above is narrowed. */
export function castCopy(messages: Messages, key: Character["castKey"]): CastCopy {
  return messages.characters.roster.cast[key] as CastCopy;
}

/** A character page URL. Locale-first, English slug, per the routing rule. */
export function characterHref(locale: string, slug: string): string {
  return `/${locale}/characters/${slug}`;
}

export function getCharacter(slug: string): Character | undefined {
  return CHARACTERS.find((character) => character.slug === slug);
}

/** Everyone but the one being looked at, for the OTHER CHAMPIONS row. */
export function otherCharacters(slug: string): Character[] {
  return CHARACTERS.filter((character) => character.slug !== slug);
}

/** `{name}'S LORE` and friends. The frame titles two sections by character. */
export function withName(template: string, name: string): string {
  return template.replace("{name}", name);
}
