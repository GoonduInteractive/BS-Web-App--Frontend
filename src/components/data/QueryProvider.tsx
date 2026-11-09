"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * TanStack Query, for the player's own data read in the browser (the pages are
 * static, so the server never knows who is looking). Coding standard: server
 * state lives here, not in Context or a store.
 *
 * Tuned for a metered-data audience: no refetch when the tab regains focus,
 * data kept fresh for a minute, one retry (the API sleeps when idle and can be
 * slow to wake, not broken).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
