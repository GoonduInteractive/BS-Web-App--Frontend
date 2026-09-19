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
 *
 * COMMENTED OUT, PER THE HUMAN (2026-09-19): the god and every adversary but
 * Nze Ugwuoke — "the gods, comment it out; for the adversary it is only Ugwuoke
 * that should show for now, comment the rest out." An entry that is not in this
 * list has no card, no modal, no detail page (the route 404s), no sitemap line
 * and no place in OTHER CHAMPIONS. Their copy stays in the message files, stale.
 * Uncomment the entry (and its card in RosterSection) to bring one back.
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
   * Extra classes for the card, modal and hero portrait — the fill-fitted one.
   * Only Omalicha carries any: her render has no alpha channel (see her entry),
   * so its black ground is faded into the field with a mask.
   */
  figureClass?: string;
  /**
   * The hero figure's BOX, when the default — the hero's full column, 912 wide,
   * right for the three square-ish cutouts — is wrong for the file. Omalicha's
   * render is 768 x 1376: covered into the wide box it showed a head and a
   * shoulder at four times life size, and contained in it the mask fell on
   * empty box rather than on the picture. Her box is the picture's own aspect,
   * so the mask fades the picture's edges and she stands on the tear like the
   * others.
   */
  heroBoxClass?: string;
  /**
   * The action shot the detail page uses for the ability thumbnails — since
   * 2026-09-19 one of the delivered 3D poses per character (before that, only
   * Soma had one and everyone else fell back to their portrait).
   */
  action: string;
  /**
   * Framing for the action shot in the 144 x 130 tile, where the default
   * `object-cover object-top` is wrong for the file. Only `soma-nysc.png` ever
   * needed one (see SOMA_TILE) and it is no longer a tile; kept for the next
   * asset that does.
   */
  actionTileClass?: string;
  /**
   * The gallery, one plate per picture — the frame drew one shot three times
   * because one shot was all there was. Each plate is `object-cover`; a class
   * here re-frames a file whose figure is not where the plate's centre is.
   */
  gallery: { src: string; className?: string }[];
};

/**
 * soma-nysc.png in the 336 x 453 gallery plate (it was the ability tile too,
 * until the delivered 3D poses took that over — SOMA_TILE is history, and the
 * measurement below is kept because the plate still needs it).
 *
 * BOTH WERE COVER, and only one of them needed a zoom. `object-cover` fits the
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
const SOMA_GALLERY = "object-cover object-[55.6%_50%] -translate-y-[8%]";

/**
 * The delivered 3D poses are portrait renders (768 x 1376 and 1536 x 2752,
 * 0.56; 1824 x 2292, 0.8) on black, with the head near the top of the frame. In
 * the 336 x 453 plate (0.74) and the 144 x 130 tile, `object-cover` scales them
 * to the box's width and crops the height — centred, that crop takes the top
 * of the head off the tall ones, so every plate and tile anchors to the top.
 */
const POSE = "object-cover object-top";

/**
 * OMALICHA HAS NO CUTOUT. The three other visible characters have a PNG with an
 * alpha channel for the card, the modal and the hero; her two renders are RGB
 * on black. Placed as they are she would sit in a black rectangle on the scar
 * card and the hero's gradient, so the portrait is masked — opaque through
 * the middle, fading over the outer 30% of each side and the bottom 30% — and
 * the black melts into the field. (A radial fade centred on her head was tried
 * first: on a picture this tall it reaches the top corners still opaque.) A reading forced by the asset, FLAGGED:
 * a cutout PNG like the others is what this wants, and it is one line here.
 */
const OMALICHA_FIGURE = "mask-x-from-70% mask-b-from-70%";
const OMALICHA_HERO_BOX = "aspect-[768/1376]";

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
// Ogbun'abali's, kept beside his commented-out entry below for when he returns.
// const OGBUN_FRAME = "w-[127.32%] left-[-11.22%] top-[-6.34%]";

export const CHARACTERS: Character[] = [
  {
    slug: "soma",
    castKey: "soma",
    group: "champions",
    image: "/assets/characters/soma-gate-character.png",
    portraitClass: SOMA_FRAME,
    action: "/assets/characters/02_Soma_3D.png",
    actionTileClass: POSE,
    gallery: [
      { src: "/assets/characters/01_Soma_3D.png", className: POSE },
      { src: "/assets/characters/02_Soma_3D.png", className: POSE },
      { src: "/assets/characters/soma-nysc.png", className: SOMA_GALLERY },
    ],
  },
  {
    slug: "kaira",
    castKey: "kaira",
    group: "champions",
    image: "/assets/characters/kaira-full.png",
    action: "/assets/characters/Pose_01_Kaira_3D.png",
    actionTileClass: POSE,
    gallery: [
      { src: "/assets/characters/Pose_01_Kaira_3D.png", className: POSE },
      { src: "/assets/characters/Pose_01_Kaira_Normal_3D.jpg", className: POSE },
      { src: "/assets/characters/kaira-full.png" },
    ],
  },
  {
    slug: "omalicha",
    castKey: "omalicha",
    group: "champions",
    image: "/assets/characters/Pose_01_Omalicha_Normal_3D.jpg",
    figureClass: OMALICHA_FIGURE,
    heroBoxClass: OMALICHA_HERO_BOX,
    action: "/assets/characters/Pose_02_Omalicha_Normal_Gun_Knife_3D.jpg",
    actionTileClass: POSE,
    gallery: [
      { src: "/assets/characters/Pose_01_Omalicha_Normal_3D.jpg", className: POSE },
      { src: "/assets/characters/Pose_02_Omalicha_Normal_Gun_Knife_3D.jpg", className: POSE },
    ],
  },
  // {
  //   slug: "ogbunabali",
  //   castKey: "ogbunabali",
  //   group: "gods",
  //   image: "/assets/characters/ogbunabali.png",
  //   portraitClass: OGBUN_FRAME,
  //   action: "/assets/characters/ogbunabali.png",
  //   gallery: [{ src: "/assets/characters/ogbunabali.png" }],
  // },
  {
    slug: "nze-ugwuoke",
    castKey: "nzeUgwuoke",
    group: "legends",
    image: "/assets/characters/Nze-Ugwuoke.png",
    action: "/assets/characters/01_Nze_3D.png",
    actionTileClass: POSE,
    gallery: [
      { src: "/assets/characters/01_Nze_3D.png", className: POSE },
      { src: "/assets/characters/Nze-Ugwuoke.png" },
    ],
  },
  // {
  //   slug: "lieutenant",
  //   castKey: "lieutenant",
  //   group: "legends",
  //   image: "/assets/characters/Lieutenant.png",
  //   action: "/assets/characters/Lieutenant.png",
  //   gallery: [{ src: "/assets/characters/Lieutenant.png" }],
  // },
  // {
  //   slug: "the-beast",
  //   castKey: "theBeast",
  //   group: "legends",
  //   image: "/assets/characters/The-Beast.png",
  //   action: "/assets/characters/The-Beast.png",
  //   gallery: [{ src: "/assets/characters/The-Beast.png" }],
  // },
  // {
  //   slug: "oji-isi",
  //   castKey: "ojiIsi",
  //   group: "legends",
  //   image: "/assets/characters/Oji-isi.png",
  //   action: "/assets/characters/Oji-isi.png",
  //   gallery: [{ src: "/assets/characters/Oji-isi.png" }],
  // },
  // {
  //   slug: "ogbuagu",
  //   castKey: "ogbuagu",
  //   group: "legends",
  //   image: "/assets/characters/Ogbuagu.png",
  //   action: "/assets/characters/Ogbuagu.png",
  //   gallery: [{ src: "/assets/characters/Ogbuagu.png" }],
  // },
  // {
  //   // MKPUME HAS NO ARTWORK OF ITS OWN. The Figma frame draws it with the
  //   // Ogbuagu render and the human confirmed reusing that file. A stand-in,
  //   // knowingly; when its own art lands, these two lines change.
  //   slug: "mkpume",
  //   castKey: "mkpume",
  //   group: "legends",
  //   image: "/assets/characters/Ogbuagu.png",
  //   action: "/assets/characters/Ogbuagu.png",
  //   gallery: [{ src: "/assets/characters/Ogbuagu.png" }],
  // },
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
  /** The alias line under the name, on the card, the modal and the hero. */
  role?: string;
  alt: string;
  bio?: string[];
  detail: {
    /**
     * The hero's two glyph stats. WEAPON and CHI TYPE since 2026-09-19 — the
     * two columns Goondu's character document carries for every character
     * (it has no difficulty for anyone). The commented-out characters' copy
     * still carries the old `role` / `difficulty` pair; it is not read.
     */
    stats: { weapon: string; chi: string };
    intro: string[];
    lore: string[];
    abilities: { name: string; text: string }[];
    /** Nze's two forms. Absent for everyone else, and the section with it. */
    variants?: { name: string; text: string }[];
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
