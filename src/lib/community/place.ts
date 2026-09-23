import type { CommunityNote } from "@/types/community";

/**
 * Where a new note goes on the wall, and how the wall makes room for it.
 *
 * THE RULE, from the human: a new note must never cover another. It goes where
 * the visitor is looking - the middle of their view - and if a note is already
 * there, that note is pushed aside to make room, and whatever it bumps into is
 * pushed in turn, until nothing overlaps. The reference wall (Frame
 * 1984078901.png) packs cards edge to edge, so "room" is a card's box plus a
 * small gap, not a clearing.
 *
 * HOW. The new card is placed and pinned. Then, for a bounded number of
 * passes, every overlap that involves a DISTURBED card - the new one, or one
 * already pushed - is separated along the axis that needs the smaller move,
 * the card further from the new one moving (so the push radiates outward from
 * the visitor's note), by the overlap plus GAP; the moved card becomes
 * disturbed in turn. Overlaps elsewhere on the wall are the frame's own - it
 * lets cards touch and lap by a few pixels - and are left exactly as they are:
 * only the corner the visitor is working in rearranges. Moves are clamped to
 * the canvas. A handful of passes settles it; the cap is there so a
 * pathological board cannot spin.
 */

export const CARD_WIDTH = 416;
export const GAP = 12;

/**
 * A card's height, from its copy: the frame's short note (two lines) is 232
 * and its long one (eight lines) is 384 - 182 of chrome and 25 a line, at the
 * ~48 characters a line the handwriting fits in the card's 352px of text.
 */
export function noteHeight(body: string): number {
  const lines = Math.max(1, Math.ceil(body.length / 48));
  return 182 + lines * 25;
}

type Box = { x: number; y: number; w: number; h: number };

const box = (n: CommunityNote): Box => ({ x: n.x, y: n.y, w: CARD_WIDTH, h: noteHeight(n.body) });

export function placeNote(
  notes: readonly CommunityNote[],
  fresh: Omit<CommunityNote, "x" | "y">,
  view: { x: number; y: number; w: number; h: number },
  bounds: { width: number; height: number },
): readonly CommunityNote[] {
  const h = noteHeight(fresh.body);
  // Centred in the view, kept on the canvas.
  const x = Math.round(Math.max(0, Math.min(bounds.width - CARD_WIDTH, view.x + view.w / 2 - CARD_WIDTH / 2)));
  const y = Math.round(Math.max(0, Math.min(bounds.height - h, view.y + view.h / 2 - h / 2)));
  const placed: CommunityNote = { ...fresh, x, y };

  const all = [...notes.map((n) => ({ ...n })), placed];
  const pinned = all.length - 1;
  const boxes = all.map(box);
  const disturbed = boxes.map((_, i) => i === pinned);
  const cx = x + CARD_WIDTH / 2;
  const cy = y + h / 2;
  const dist = (b: Box) => Math.hypot(b.x + b.w / 2 - cx, b.y + b.h / 2 - cy);

  for (let pass = 0; pass < 40; pass += 1) {
    let moved = false;
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        if (!disturbed[i] && !disturbed[j]) continue;
        const a = boxes[i];
        const b = boxes[j];
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + GAP;
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + GAP;
        if (ox <= 0 || oy <= 0) continue;
        // The one to move: never the pinned card; otherwise the further one.
        const mover = i === pinned ? j : j === pinned ? i : dist(a) >= dist(b) ? i : j;
        const other = mover === i ? j : i;
        const m = boxes[mover];
        const o = boxes[other];
        if (ox < oy) {
          m.x += m.x + m.w / 2 >= o.x + o.w / 2 ? ox : -ox;
        } else {
          m.y += m.y + m.h / 2 >= o.y + o.h / 2 ? oy : -oy;
        }
        m.x = Math.max(0, Math.min(bounds.width - m.w, m.x));
        m.y = Math.max(0, Math.min(bounds.height - m.h, m.y));
        disturbed[mover] = true;
        moved = true;
      }
    }
    if (!moved) break;
  }

  return all.map((n, i) =>
    n.x === boxes[i].x && n.y === boxes[i].y ? n : { ...n, x: Math.round(boxes[i].x), y: Math.round(boxes[i].y) },
  );
}
