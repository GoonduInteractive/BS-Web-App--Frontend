"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api/client";
import type { CartIndexEntry } from "@/lib/api/merch";
import { addToCart, changeCartItem, getCart, isStockRefusal, removeCartItem } from "@/lib/api/store";
import { authHref } from "@/lib/utils/auth-links";
import type { Locale } from "@/lib/utils/locales";
import type { CartLine } from "@/types/merch";

/** The cart's cache key. */
export const CART = ["store", "cart"] as const;

type Identity = Pick<CartLine, "slug" | "colourId" | "size">;

const sameLine = (a: CartLine, b: Identity) => a.slug === b.slug && a.colourId === b.colourId && a.size === b.size;

type CartValue = {
  lines: readonly CartLine[];
  /** Total number of items, which is what the cart badge shows. */
  count: number;
  /** Resolves true once the line is in the cart (the caller says so); false if it isn't, or sign-in comes first. */
  add: (line: CartLine) => Promise<boolean>;
  setQuantity: (slug: string, colourId: string, size: string, quantity: number) => void;
  remove: (slug: string, colourId: string, size: string) => void;
  clear: () => void;
  /** A change is on its way to the API. */
  busy: boolean;
  /** Why the last change didn't land - the components word it. */
  failed: "network" | "stock" | "unknown" | null;
  /** Forgets `failed`. It is about one item, and this context outlives the page: it goes when the choice does. */
  clearFailed: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({
  children,
  index = [],
  locale,
}: {
  children: ReactNode;
  /** Every variant the cart can hold, as a line (`getCartIndex`). */
  index?: readonly CartIndexEntry[];
  locale: Locale;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const queries = useQueryClient();
  // Read again on coming back to the tab: an order placed elsewhere (a phone, another tab) empties this cart too.
  const server = useQuery({ queryKey: CART, queryFn: getCart, enabled: status === "signed-in", refetchOnWindowFocus: true });
  const change = useMutation({
    mutationFn: (send: () => Promise<void>) => send(),
    // The shopper sees `failed`, worded; in development the console says what the API said.
    onError: (e) => {
      if (process.env.NODE_ENV !== "production") console.error("[cart] the change didn't land:", e instanceof ApiError ? `${e.status} ${e.message}` : e);
    },
    onSettled: () => queries.invalidateQueries({ queryKey: CART }),
  });

  const lines = useMemo(() => {
    const byVariant = new Map(index.map((entry) => [entry.variantId, entry]));
    return (server.data ?? []).flatMap((item): CartLine[] => {
      const entry = byVariant.get(item.variant_id);
      return entry
        ? [{ slug: entry.slug, colourId: entry.colourId, size: entry.size, quantity: item.quantity, variantId: item.variant_id }]
        : [];
    });
  }, [server.data, index]);

  const variantFor = useCallback(
    (line: Identity & { variantId?: string }) =>
      line.variantId ?? index.find((entry) => sameLine({ ...entry, quantity: 0 }, line))?.variantId,
    [index],
  );

  /* ---- The verbs ---- */

  const { mutate, mutateAsync, reset: clearFailed } = change;
  const add = useCallback(
    async (line: CartLine) => {
      if (status !== "signed-in") {
        router.push(authHref(locale, "sign-in", window.location.pathname));
        return false;
      }
      const variant = variantFor(line);
      // A failure is also `failed`, which the page words under the button.
      return mutateAsync(() => (variant ? addToCart(variant, line.quantity) : Promise.reject(new Error(`No variant for ${line.slug}`)))).then(
        () => true,
        () => false,
      );
    },
    [status, router, locale, variantFor, mutateAsync],
  );
  const remove = useCallback(
    (slug: string, colourId: string, size: string) => {
      const variant = variantFor({ slug, colourId, size });
      if (variant) mutate(() => removeCartItem(variant));
    },
    [variantFor, mutate],
  );
  const setQuantity = useCallback(
    (slug: string, colourId: string, size: string, quantity: number) => {
      const current = lines.find((line) => sameLine(line, { slug, colourId, size }));
      if (!current?.variantId) return;
      if (quantity < 1) return remove(slug, colourId, size);
      const delta = quantity - current.quantity;
      const variant = current.variantId;
      if (delta) mutate(() => changeCartItem(variant, delta));
    },
    [lines, remove, mutate],
  );
  // Placing an order empties the API's cart; this just reads it again.
  const clear = useCallback(() => {
    void queries.invalidateQueries({ queryKey: CART });
  }, [queries]);

  const failed = !change.isError
    ? null
    : isStockRefusal(change.error)
      ? "stock"
      : change.error instanceof ApiError && change.error.status === 0
        ? "network"
        : "unknown";

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      busy: change.isPending,
      failed,
      clearFailed,
    }),
    [lines, add, setQuantity, remove, clear, change.isPending, failed, clearFailed],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}
