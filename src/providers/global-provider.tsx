"use client";

import { ThemeProvider } from "next-themes";
import { AnimationProvider } from "./animation-provider";
import { Web3Provider } from "./web3-provider";
import { ChainAlertProvider } from "./chain-alert-provider";
import { SecretProvider } from "@/modules/auth/context";

export function GlobalProvider({
  children,
  sessionSecret,
}: {
  children: React.ReactNode;
  sessionSecret: string | null;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      <SecretProvider secretKey={sessionSecret}>
        <Web3Provider>
          <ChainAlertProvider />
          <AnimationProvider>{children}</AnimationProvider>
        </Web3Provider>
      </SecretProvider>
    </ThemeProvider>
  );
}
