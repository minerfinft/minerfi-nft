"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/web3/config";

/**
 * Wraps the whole app so the marketing pages and the dashboard share one
 * wallet session — connecting from the landing page navbar means arriving at
 * /app already connected, rather than being asked twice.
 *
 * Being a client component does not drag the tree with it: everything passed
 * as `children` is still rendered on the server.
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  // Created once per browser session. A module-level QueryClient would be
  // shared across every request on the server and leak one user's cached
  // balances into another's response.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Chain reads are cheap and the numbers move constantly; a long
            // stale window would show a claimed balance as still pending.
            staleTime: 4_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
