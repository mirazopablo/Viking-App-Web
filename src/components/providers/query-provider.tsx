"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider:
 * Wraps the Next.js application with TanStack Query v5 Client Provider
 * and initializes the Sonner Toaster for global UI notifications.
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // Ensure QueryClient is instantiated once per client session to avoid hydration mismatches
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,       // 1 minute default stale time
            refetchOnWindowFocus: false, // Prevent aggressive refetching on window switch
            retry: 1,                   // Retry failed requests once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
};
