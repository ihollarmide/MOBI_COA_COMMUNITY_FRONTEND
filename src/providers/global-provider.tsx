"use client";

import { ThemeProvider } from "next-themes";
import { AnimationProvider } from "./animation-provider";
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
        <ChainAlertProvider />
        <AnimationProvider>{children}</AnimationProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}
