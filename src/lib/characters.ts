/**
 * What the character pages know that the CMS does not: how each delivered
 * picture is cropped into a card, a tile, a plate or the hero, and two small
 * helpers for URLs and titles.
 *
 * WHO IS ON THE ROSTER LIVES IN THE CMS since 2026-09-22 - `src/content/
 * characters/`, read by `src/lib/api/characters.ts`. Before that this file held
 * the manifest and the copy sat in `src/messages`; the four characters with
 * copy from Goondu's character bible were moved into the collection as they
 * were, and the six parked ones went in switched off with their name, group and
 * portrait only, for an editor to complete from the bible.
 *
 * FRAMING IS KEYED BY THE PICTURE FILE, not by the character. A framing
 * constant is only ever valid for the file it was measured on - Kaira had one
 * solved against `kaira-crop.png`, the card later moved to `kaira-full.png`,
 * and the stale numbers shrank her to 78% of the card - so it follows the
 * file: whoever the editor attaches `soma-gate-character.png` to gets Soma's
 * crop, and a file nobody has measured gets the component's own default.
 */

// ---------------------------------------------------------------------------
// The roster card and the modal - hand-placed portraits
// ---------------------------------------------------------------------------

/**
 * Framing for the portraits the frame hand-places, as literal Tailwind classes
 * on an absolutely positioned image (see `portraitClass` on CharacterCard for
 * how they were solved).
 *
 *   soma        w 488, dx -42, dy   0   against a 410 card  -> mae  3.3
 *   ogbunabali  w 522, dx -46, dy -26                       -> mae 16.0
 *
 * FLAGGED: Ogbun'abali's fit is not Soma's, at 16.0 against 3.3, which most
 * likely means the frame was drawn from a different export of that render than
 * the file delivered. Far closer than any object-fit rule gets, and worth
 * confirming against Figma. Everyone else's file fills its own canvas like the
 * six legends assets do and takes plain `object-cover`.
 */
const PORTRAIT_FRAMING: Readonly<Record<string, string>> = {
  "/assets/characters/soma-gate-character.png": "w-[119.02%] left-[-10.24%] top-0",
  "/assets/characters/ogbunabali.png": "w-[127.32%] left-[-11.22%] top-[-6.34%]",
};

/**
 * A PORTRAIT WITH NO CUTOUT IS MASKED INTO ITS FIELD. Most characters have a
 * PNG with an alpha channel for the card, the modal and the hero; the
 * delivered 3D poses are JPEGs - RGB on black, since JPEG has no alpha
 * channel at all. Placed as they are, such a portrait sits in a black
 * rectangle on the scar card and the hero's gradient, so it is masked instead
 * - opaque through the middle, fading over the outer 30% of each side and the
 * bottom 30% - and the black melts into the field. (A radial fade centred on
 * the head was tried first: on a picture this tall it reaches the top corners
 * still opaque.)
 *
 * THE FILE'S TYPE IS THE TEST, not a list of names, because the editor chooses
 * the portrait now: Omalicha shipped on one of these (2026-09-19) and Kaira was
 * moved onto one in /admin (2026-09-22), both 768 x 1376. A PNG that turns out
 * to be on black rather than cut out would need naming here.
 *
 * FLAGGED, as it was for Omalicha: cutout PNGs like the others are what this
 * wants, and then the rule simply stops applying.
 */
const isFlat = (image: string) => /\.jpe?g$/i.test(image);
const FLAT_FIGURE = "mask-x-from-70% mask-b-from-70%";

/**
 * The hero figure's BOX, when the default - the hero's full column, 912 wide,
 * right for the square-ish cutouts - is wrong for the file. The pose renders
 * are 768 x 1376: covered into the wide box they show a head and a shoulder at
 * four times life size, and contained in it the mask falls on empty box rather
 * than on the picture. Their box is the pose's own aspect, so the mask fades
 * the picture's edges and the figure stands on the tear like the others.
 */
const FLAT_HERO_BOX = "aspect-[768/1376]";

// ---------------------------------------------------------------------------
// The ability tiles and the gallery plates
// ---------------------------------------------------------------------------

/**
 * The delivered 3D poses are portrait renders (768 x 1376 and 1536 x 2752,
 * 0.56; 1824 x 2292, 0.8) on black, with the head near the top of the frame.
 * In the 336 x 453 plate (0.74) and the 144 x 130 tile, `object-cover` scales
 * them to the box's width and crops the height - centred, that crop takes the
 * top of the head off the tall ones, so every plate and tile anchors to the
 * top. Goondu names every pose file with `_3D`, which is the rule here.
 */
const POSE = "object-cover object-top";
const isPose = (file: string) => /_3D\.[a-z]+$/i.test(file);

/**
 * soma-nysc.png in the 336 x 453 gallery plate. `object-cover` fits the square
 * canvas to the box's larger axis and lands the figure at the frame's size, so
 * it takes no scale - an earlier 1.27 cropped his head. The translate puts his
 * off-centre figure back in the middle: he sits 5.6% right and 8.3% low in his
 * own canvas.
 *
 * `scale` and `translate` are separate CSS properties in Tailwind v4, so both
 * survive on one element - but neither survives GSAP touching it, which is why
 * the gallery tweens a wrapper. See DetailBody's scene, note 3.
 *
 * FLAGGED: the frame's tiles show this figure on a dark blue-grey backdrop, but
 * the delivered file is a cutout with 45% of its canvas transparent. The plate
 * colour is a CSS fill here rather than part of the art.
 */
const GALLERY_CLASS: Readonly<Record<string, string>> = {
  "/assets/characters/soma-nysc.png": "object-cover object-[55.6%_50%] -translate-y-[8%]",
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/** The hand-placed crop for a roster card or modal portrait, or undefined for a plain cover. */
export function portraitFraming(image: string): string | undefined {
  return PORTRAIT_FRAMING[image];
}

/** Extra classes for a fill-fitted portrait - the mask a render without alpha needs. */
export function figureClass(image: string): string | undefined {
  return isFlat(image) ? FLAT_FIGURE : undefined;
}

/** The hero figure's box, when the file needs its own. */
export function heroBoxClass(image: string): string | undefined {
  return isFlat(image) ? FLAT_HERO_BOX : undefined;
}

/** Framing for an ability's own action shot in its 144 x 130 tile. */
export function actionTileClass(image: string): string {
  return isPose(image) ? POSE : "object-cover object-top";
}

/** Framing for one gallery plate. */
export function galleryClass(image: string): string {
  return GALLERY_CLASS[image] ?? (isPose(image) ? POSE : "object-cover");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A character page URL. Locale-first, English slug, per the routing rule. */
export function characterHref(locale: string, slug: string): string {
  return `/${locale}/characters/${slug}`;
}

/** `{name}'S LORE` and friends. The frame titles two sections by character. */
export function withName(template: string, name: string): string {
  return template.replace("{name}", name);
}
