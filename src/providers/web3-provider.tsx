"use client";

import { ConnectKitProvider } from "connectkit";
import { WagmiProvider } from "wagmi";

import { ReactNode } from "react";
import { config as wagmiConfig } from "@/config/wagmi";
import { ReactQueryProvider } from "./react-query-provider";

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <ReactQueryProvider>
        <ConnectKitProvider
          options={{
            hideRecentBadge: true,
            initialChainId:
              process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? 56 : 84532,
            disclaimer: (
              <div className="text-[#cfd0d2] text-xs leading-[1.3] tracking-sm font-inter">
                By connecting your wallet, you agree to the{" "}
                <a className="text-[#cfd0d2]" href="/terms">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a className="text-[#cfd0d2]" href="/privacy">
                  Privacy Policy
                </a>
              </div>
            ),
          }}
          mode="dark"
        >
          {children}
        </ConnectKitProvider>
      </ReactQueryProvider>
    </WagmiProvider>
  );
}
