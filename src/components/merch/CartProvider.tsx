"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type { CartLine, ProductSize } from "@/types/merch";

/**
 * The cart. Client state, and only client state.
 *
 * WHY CONTEXT AND NOT TANSTACK QUERY. The coding standard puts server state in
 * TanStack Query and global client state in Context, and a cart in this build is
 * unambiguously the second: there is no server to hold it, nothing is fetched,
 * and nothing is sent. It sits beside `locale`, `sound on/off` and `menu open`.
 *
 * IT NEVER LEAVES THE BROWSER. `localStorage` is the whole of its persistence.
 * No request carries it, no analytics sees it, and the checkout screens read it
 * to draw an order summary rather than to submit one.
 *
 * A LINE IS IDENTIFIED BY SLUG + COLOUR + SIZE, not by slug. Two hoodies in
 * different sizes are two lines, and adding a size you already hold increments
 * that line instead of creating a second one - which is what the cart frame
 * shows, three lines each with its own colour and size.
 *
 * WRITES ARE A REDUCER, not a pile of setState calls, because every mutation is
 * a small transform of the same list and three of the four have to merge or
 * prune rather than append.
 */

const STORAGE_KEY = "bs.cart.v1";

type CartAction =
  | { type: "add"; line: CartLine }
  | { type: "setQuantity"; slug: string; colourId: string; size: ProductSize; quantity: number }
  | { type: "remove"; slug: string; colourId: string; size: ProductSize }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

const sameLine = (a: CartLine, b: Pick<CartLine, "slug" | "colourId" | "size">) =>
  a.slug === b.slug && a.colourId === b.colourId && a.size === b.size;

function reducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;

    case "add": {
      const existing = state.find((line) => sameLine(line, action.line));
      if (!existing) return [...state, action.line];
      return state.map((line) =>
        sameLine(line, action.line)
          ? { ...line, quantity: line.quantity + action.line.quantity }
          : line,
      );
    }

    case "setQuantity":
      // Zero removes the line rather than leaving an empty one behind, so the
      // minus button at quantity 1 does the obvious thing.
      if (action.quantity < 1) {
        return state.filter((line) => !sameLine(line, action));
      }
      return state.map((line) =>
        sameLine(line, action) ? { ...line, quantity: action.quantity } : line,
      );

    case "remove":
      return state.filter((line) => !sameLine(line, action));

    case "clear":
      return [];
  }
}

type CartValue = {
  lines: readonly CartLine[];
  /** Total number of items, which is what the cart badge shows. */
  count: number;
  add: (line: CartLine) => void;
  setQuantity: (slug: string, colourId: string, size: ProductSize, quantity: number) => void;
  remove: (slug: string, colourId: string, size: ProductSize) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);

  // READ ON MOUNT, NOT DURING RENDER. The server prerenders this page, so the
  // first client render must match the server's empty cart or React logs a
  // hydration mismatch and throws the tree away. Reading in an effect means the
  // badge flicks from 0 to its real count on the first frame, which is correct
  // rather than merely tolerable: the cart genuinely is unknown until the
  // browser has been asked.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      // Shape-check every line rather than trusting the blob: this is data the
      // visitor can edit, and a malformed entry would otherwise render as NaN.
      const lines = parsed.filter(
        (line): line is CartLine =>
          !!line &&
          typeof line === "object" &&
          typeof (line as CartLine).slug === "string" &&
          typeof (line as CartLine).colourId === "string" &&
          typeof (line as CartLine).size === "string" &&
          Number.isFinite((line as CartLine).quantity) &&
          (line as CartLine).quantity > 0,
      );
      if (lines.length) dispatch({ type: "hydrate", lines });
    } catch {
      // Private mode, cleared storage, or a corrupt value. An empty cart is the
      // correct fallback and there is nothing to tell the visitor.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage full or blocked. The cart still works for this page view.
    }
  }, [lines]);

  const add = useCallback((line: CartLine) => dispatch({ type: "add", line }), []);
  const setQuantity = useCallback(
    (slug: string, colourId: string, size: ProductSize, quantity: number) =>
      dispatch({ type: "setQuantity", slug, colourId, size, quantity }),
    [],
  );
  const remove = useCallback(
    (slug: string, colourId: string, size: ProductSize) =>
      dispatch({ type: "remove", slug, colourId, size }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}
