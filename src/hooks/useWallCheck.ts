"use client";

import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { getWallFilterList } from "@/lib/api/wall-filter";
import type { FilterResult } from "@/lib/community/filter";

type Check = (note: string) => FilterResult;

/**
 * The engine and the list arrive together, when the sheet opens: neither is
 * on the Community page's first load. The list is compiled once per visit.
 */
async function loadCheck(): Promise<Check> {
  const [engine, list] = await Promise.all([import("@/lib/community/filter"), getWallFilterList()]);
  const compiled = engine.compileWallFilter(list);
  return (note) => engine.checkNote(compiled, note);
}

const WALL_CHECK = queryOptions({
  queryKey: ["community", "wall-filter"],
  queryFn: loadCheck,
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
});

/**
 * The community wall filter, for the note sheet. `prepare` starts loading it;
 * `check` runs a note through it, and resolves null when no list could be had
 * (offline, say): the note is then sent unchecked, and the server's check -
 * the source of truth, per the guide - has the final word. A failed load is
 * tried again on the next check.
 */
export function useWallCheck() {
  const client = useQueryClient();
  return useMemo(
    () => ({
      prepare: () => void client.prefetchQuery(WALL_CHECK),
      check: async (note: string): Promise<FilterResult | null> => {
        try {
          return (await client.fetchQuery(WALL_CHECK))(note);
        } catch {
          return null;
        }
      },
    }),
    [client],
  );
}
