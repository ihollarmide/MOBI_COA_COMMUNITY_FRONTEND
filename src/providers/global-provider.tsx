"use client";

import { ThemeProvider } from "next-themes";
import { AnimationProvider } from "./animation-provider";
import { ReactQueryProvider } from "./react-query-provider";
import { Web3Provider } from "./web3-provider";
import { AuthProvider } from "./auth-provider";
import { ChainAlertProvider } from "./chain-alert-provider";

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      <AuthProvider>
        <Web3Provider>
          <ReactQueryProvider>
            <ChainAlertProvider />
            <AnimationProvider>{children}</AnimationProvider>
          </ReactQueryProvider>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}
