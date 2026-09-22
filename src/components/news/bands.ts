import type { BandColour } from "@/types/news";

/**
 * What each band colour an admin can pick paints on a torn cover.
 *
 * WHOLE CLASS NAMES, never built at runtime: Tailwind scans source text, and a
 * `text-${band}` that exists nowhere generates nothing (see the note on
 * `ComicIssue.cover` in `types/merch.ts` for the day that happened).
 *
 * `seam` is the band itself — `TornSurface` paints in `currentColor`. The chip
 * pairs with the band the way the frame pairs them: the blue plate on the
 * grey-blue band ("Registration opens…"), the cream plate on the red one
 * ("Combat update…"). The field behind the picture is the same dark backdrop on
 * both banners in the frame and is not a choice.
 */
const BLUE_CHIP = "text-ink bg-[url('/assets/ornaments/onu-uzo-blue.svg')]";
const CREAM_CHIP = "text-ink bg-[url('/assets/ornaments/onu-uzo-chip.svg')]";

export const BAND_FIELD = "bg-abyss";

export const BAND: Record<BandColour, { seam: string; chip: string }> = {
  dusk: { seam: "text-dusk", chip: BLUE_CHIP },
  clot: { seam: "text-clot", chip: CREAM_CHIP },
  ember: { seam: "text-ember", chip: CREAM_CHIP },
  oxblood: { seam: "text-oxblood", chip: CREAM_CHIP },
  blood: { seam: "text-blood", chip: CREAM_CHIP },
  carmine: { seam: "text-carmine", chip: CREAM_CHIP },
  crimson: { seam: "text-crimson", chip: CREAM_CHIP },
  menu: { seam: "text-menu", chip: CREAM_CHIP },
  abyss: { seam: "text-abyss", chip: BLUE_CHIP },
  ash: { seam: "text-ash", chip: BLUE_CHIP },
};

/** A stable tear per article, so two banners never share a rag but a banner never changes between builds. */
export function seedFor(slug: string): number {
  let h = 7;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 100_003;
  return h + 1;
}
