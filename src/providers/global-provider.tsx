"use client";

import { ThemeProvider } from "next-themes";
import { AnimationProvider } from "./animation-provider";
import { ReactQueryProvider } from "./react-query-provider";
import { Web3Provider } from "./web3-provider";
import { ChainAlertProvider } from "./chain-alert-provider";

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      <Web3Provider>
        <ReactQueryProvider>
          <ChainAlertProvider />
          <AnimationProvider>{children}</AnimationProvider>
        </ReactQueryProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}
