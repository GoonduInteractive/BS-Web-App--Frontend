import type { LucideIcon } from "lucide-react";

import { BracketButton } from "@/components/ui/BracketButton";

/**
 * An empty state, to the empty cart's anatomy (`CartView` → `EmptyCart`, from
 * the frame `Merch Store- Cart (1).png`): a flat glyph in `--color-mist` at
 * 208 / 300, a heading, a line under it, and - when the state owns a page -
 * a bracket CTA. No frame exists for the states that use this (the News page
 * before its first article, the team before its first person), so they borrow
 * the cart's shape and speak lines that already exist in both locales.
 *
 * THE GLYPH IS A LUCIDE ICON, per the human (2026-09-22): nothing was delivered
 * for these states, and the icon stands in at the cart glyph's size and colour
 * until a file arrives. Stroke 1.25 so that at 300px it reads as a drawing, not
 * an outline.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  /** The page-level states have one; a section inside a page does not. */
  cta?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <Icon aria-hidden strokeWidth={1.25} className="text-mist h-auto w-52 select-none md:w-75" />

      <h2 className="font-display text-menu-fg mt-10.75 text-[2.25rem] leading-none font-semibold tracking-tighter uppercase">
        {title}
      </h2>
      <p className="text-menu-fg font-body text-body mt-0.75 max-w-[32rem] leading-tight">{body}</p>

      {cta ? (
        <div className="mt-11.75">
          <BracketButton href={cta.href} className="px-3.75 py-[1.15rem] tracking-normal">
            {cta.label}
          </BracketButton>
        </div>
      ) : null}
    </div>
  );
}
