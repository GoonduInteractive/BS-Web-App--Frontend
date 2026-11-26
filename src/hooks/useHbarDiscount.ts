"use client";

import { useQuery } from "@tanstack/react-query";

import { HEDERA_ON } from "@/lib/hedera/mode";

/**
 * The HBAR checkout discount, in percent (the admin's Treasury setting; 0 is
 * none). Its own file, and the Hedera adapter imported only when asked, so the
 * merch checkout carries none of the Hedera mock while the section is off.
 */
export function useHbarDiscount(): number {
  const query = useQuery({
    queryKey: ["hedera", "discount"],
    queryFn: async () => (await import("@/lib/api/hedera")).getHbarDiscountPct(),
    enabled: HEDERA_ON,
    staleTime: 5 * 60_000,
  });
  return HEDERA_ON ? (query.data ?? 0) : 0;
}

/** What the discount takes off a naira total: whole naira, rounded down. */
export const hbarDiscountOff = (total: number, pct: number) => (pct > 0 ? Math.floor((total * pct) / 100) : 0);
