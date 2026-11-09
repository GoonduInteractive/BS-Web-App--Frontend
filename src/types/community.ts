/**
 * The community wall's contract. Notes come from the game backend through
 * `src/lib/api/community.ts`.
 */

/** The four papers a note can be written on - the frame's tints, as tokens. */
export type NoteTint = "cream" | "mint" | "sky" | "rose";

export type CommunityNote = {
  id: string;
  /** The display name shown beside the avatar. */
  author: string;
  body: string;
  likes: number;
  /** ISO instant. Rendered relative - "30 mins ago" - in the reader's locale. */
  postedAt: string;
  tint: NoteTint;
  /**
   * Where the note sits on the wall, in wall pixels from its top-left. The wall
   * is a fixed canvas (`WALL`) the visitor pans around; a note's place on it is
   * part of the note, the way a pin's place on a board is.
   */
  x: number;
  y: number;
};

/** The wall's canvas, in pixels, and where a fresh visitor first looks at it. */
export type WallBounds = {
  width: number;
  height: number;
  /** The point of the canvas that sits at the viewport's top-left on arrival at 1440. */
  origin: { x: number; y: number };
  /**
   * The same for a phone, where the canvas is drawn at `narrowScale` - the
   * phone frame's cards are 258 wide against the desktop's 416, the same
   * cards at 0.62 - and opens on a different part of the collage.
   */
  narrowScale: number;
  narrowOrigin: { x: number; y: number };
};
