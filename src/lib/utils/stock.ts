import type { CartLine } from "@/types/merch";

/**
 * How many more of a variant can go in the cart: what the API has, less what
 * this cart already holds. Null where it keeps no count (an online chapter).
 *
 * THE CATALOGUE CAN BE AN HOUR OLD (the store's pages rebuild hourly), so this
 * only spares the player a refusal. The API has the last word, and that refusal
 * is told apart by `isStockRefusal`.
 */
export function roomLeft(stock: number | null | undefined, variantId: string | undefined, lines: readonly CartLine[]): number | null {
  if (stock == null) return null;
  const held = variantId ? (lines.find((line) => line.variantId === variantId)?.quantity ?? 0) : 0;
  return Math.max(0, stock - held);
}
