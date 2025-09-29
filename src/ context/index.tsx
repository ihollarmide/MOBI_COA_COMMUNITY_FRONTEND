"use client";

import { wagmiAdapter, projectId } from "@/config/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { baseSepolia, bsc } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "COA Community Airdrop",
  description: "COA Community Airdrop",
  url: process.env.NEXT_PUBLIC_APP_URL,
  icons: [`${process.env.NEXT_PUBLIC_APP_URL}/favicon.ico`],
};

const isMainnet =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ||
  process.env.NEXT_PUBLIC_ENVIRONMENT === "uat";

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia, bsc],
  defaultNetwork: isMainnet ? bsc : baseSepolia,
  metadata: metadata,
  features: {
    analytics: true,
    socials: false,
    email: false,
  },
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
