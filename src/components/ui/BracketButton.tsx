import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The red CTA flanked by bracket ornaments. It appears on every screen in the
 * prototype, so it is built once here (overview section 9).
 *
 * The brackets are one 12x36 SVG used twice, mirrored on the right. They sit
 * outside the hit target: they are decoration, not part of the control.
 *
 * NOTE: overview section 8 gives Button as "Teko Heavy 14/22.7", but Figma and
 * the human both put the entry label in Host Grotesk. Following Figma. Raised.
 */
export function BracketButton({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <span className="inline-flex items-center gap-4">
      <Bracket />
      <button
        type="button"
        className={cn(
          "bg-signal text-menu-fg font-body text-h7 leading-none tracking-wide",
          "px-4 py-4 transition-colors duration-200",
          "hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-4",
          "focus-visible:outline-signal disabled:bg-disabled disabled:text-disabled-fg",
          className,
        )}
        {...props}
      >
        {children}
      </button>
      <Bracket mirrored />
    </span>
  );
}

function Bracket({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <Image
      src="/assets/ornaments/button-bracket.svg"
      alt=""
      aria-hidden
      width={12}
      height={36}
      className={cn("h-9 w-3 select-none", mirrored && "-scale-x-100")}
    />
  );
}
