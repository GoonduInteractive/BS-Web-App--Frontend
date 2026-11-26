"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { clsx as cn } from "clsx";
import type { Messages } from "@/lib/utils/messages";

const ITEMS = [
  ["hub", "/hedera/hub"],
  ["store", "/hedera/store"],
  ["exclusives", "/hedera/exclusives"],
  ["activity", "/hedera/activity"],
] as const;

/**
 * The Hedera section's own pages. Drawn like `PanelTab` - the 6px marker and
 * the bracketed underline - but as links, since each is its own page.
 */
export function HederaNav({ messages, locale, className }: { messages: Messages; locale: string; className?: string }) {
  const t = messages.hedera.nav;
  const pathname = usePathname();

  return (
    <nav aria-label={t.label} className={cn("flex flex-wrap gap-x-6 gap-y-3 md:gap-x-7.5", className)}>
      {ITEMS.map(([key, path]) => {
        const href = `/${locale}${path}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className="text-menu-fg font-body text-body focus-visible:outline-signal flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="flex items-center gap-2 px-1 whitespace-nowrap">
              <span aria-hidden className={cn("size-1.5 shrink-0", active ? "bg-signal" : "bg-disabled-fg")} />
              {t[key]}
            </span>
            <span aria-hidden className={cn("border-signal relative mt-0.5 h-1.5 w-full border-x-2", !active && "invisible")}>
              <span className="bg-signal absolute inset-x-0 top-0.5 h-px" />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
