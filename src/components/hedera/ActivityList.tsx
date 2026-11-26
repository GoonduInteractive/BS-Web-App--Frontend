import Link from "next/link";

import { HashscanLink } from "@/components/hedera/bits";
import { QUIET } from "@/components/hedera/styles";
import { formatHbar, formatMoment } from "@/lib/hedera/format";
import type { Messages } from "@/lib/utils/messages";
import type { HederaActivity } from "@/types/hedera";

/**
 * Purchases, claims, prizes and refunds, newest first, each with its HashScan
 * link. The kind, title, date and link stack in one column and only the HBAR
 * sits beside them, so a phone's row keeps room for the title.
 */
export function ActivityList({ rows, messages, locale }: { rows: readonly HederaActivity[]; messages: Messages; locale: string }) {
  const t = messages.hedera;

  return (
    <ul className="flex flex-col">
      {rows.map((row) => {
        const href = row.href ? `/${locale}/hedera/${row.href.kind}?id=${encodeURIComponent(row.href.id)}` : null;
        return (
          <li key={row.id} className="border-menu-fg/12 flex items-start gap-4 border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <span className="bg-menu-fg/10 text-menu-fg font-body inline-block rounded-sm px-2 pt-1.5 pb-1 text-[0.75rem] leading-none tracking-wider uppercase">
                {t.activity.kinds[row.kind]}
              </span>
              {href ? (
                <Link
                  href={href}
                  className="text-menu-fg font-body text-body focus-visible:outline-signal mt-2 block leading-snug hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {row.title}
                </Link>
              ) : (
                <p className="text-menu-fg font-body text-body mt-2 leading-snug">{row.title}</p>
              )}
              <p className={`${QUIET} mt-1`}>{formatMoment(row.at)}</p>
              {row.txId ? <HashscanLink kind="transaction" value={row.txId} label={t.viewOnHashscan} className="mt-2" /> : null}
            </div>
            {row.hbar !== null ? (
              <p className="font-display text-menu-fg shrink-0 pt-6 text-[1.25rem] leading-none font-semibold tracking-[-0.02em]">
                {row.hbar > 0 ? "+" : "−"}
                {formatHbar(Math.abs(row.hbar), messages)}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
