import type { HallEntry } from "@/types/hall";

/**
 * The hall's champions, behind a typed contract. NO BACKEND: these are the
 * Competition frame's three cards - one handle, three seasons, one portrait -
 * which is what the comp draws and is FLAGGED as such. The handle is the
 * profile's own mock, so the site has one champion, not two.
 *
 * THE FRAME WRITES "Wrath of Nze Nwoke" on season 1. Every other frame on this
 * page and the tournaments adapter call him Nze Ugwuoke, so the card reads the
 * tournament's own name through its key rather than carrying the variant.
 */
const HALL: readonly HallEntry[] = [
  {
    slug: "season-1",
    handle: "somamain",
    season: 1,
    tournamentKey: "wrathOfNze",
    portrait: { src: "/assets/competition/image 67.png", width: 375, height: 442 },
  },
  {
    slug: "season-2",
    handle: "somamain",
    season: 2,
    portrait: { src: "/assets/competition/image 67.png", width: 375, height: 442 },
  },
  {
    slug: "season-3",
    handle: "somamain",
    season: 3,
    portrait: { src: "/assets/competition/image 67.png", width: 375, height: 442 },
  },
];

export async function getHallOfAscension(): Promise<readonly HallEntry[]> {
  return HALL;
}
