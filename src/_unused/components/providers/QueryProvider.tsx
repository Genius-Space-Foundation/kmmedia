"use client";

/**
 * React Query Provider Component
 *
 * This component wraps the application with React Query's QueryClientProvider,
 * enabling data fetching, caching, and synchronization throughout the app.
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { createQueryClient } from "@/lib/react-query";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider component that provides React Query context to the application
 *
 * @param children - Child components that will have access to React Query
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a stable query client instance
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
