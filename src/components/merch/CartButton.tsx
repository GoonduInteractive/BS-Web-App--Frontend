"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/merch/CartProvider";
import type { Messages } from "@/lib/utils/messages";

/**
 * The cart control, top right of every store screen. Ash plate, white glyph,
 * gild count badge — measured off the frame at roughly 60 x 48.
 *
 * The badge is hidden at zero rather than showing "0", which is what the frames
 * draw, and the accessible name carries the count so it is not colour-only.
 */
export function CartButton({ messages, locale }: { messages: Messages; locale: string }) {
  const { count } = useCart();
  const t = messages.merch.nav;

  return (
    <Link
      href={`/${locale}/merch/cart`}
      aria-label={`${t.cart}: ${count} ${t.cartCount}`}
      className="bg-ash focus-visible:outline-signal relative inline-flex h-12 w-15 items-center justify-center gap-1 transition-opacity duration-150 ease-gate hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <Image
        src="/assets/merch/cart-m.svg"
        alt=""
        aria-hidden
        width={300}
        height={300}
        className="size-5.5 select-none"
      />
      {count > 0 ? (
        <span className="bg-gild text-ink font-body grid size-6 place-items-center rounded-full text-[0.8125rem] font-semibold">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
