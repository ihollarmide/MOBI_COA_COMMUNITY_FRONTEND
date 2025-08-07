"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientConfig } from "@tanstack/react-query";
import { useRef } from "react";

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      networkMode: "online",
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always",
      refetchInterval: false,
      refetchIntervalInBackground: false,
      staleTime: 2000 * 3600,
    },
    mutations: {
      networkMode: "online",
      retry: false,
    },
  },
};

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useRef(new QueryClient(queryClientConfig));

  return (
    <QueryClientProvider client={queryClient.current}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
