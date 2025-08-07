"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

type WalletConnectionStatus =
  | "idle"
  | "connected"
  | "disconnected"
  | "connecting"
  | "reconnecting";

export function useWalletConnectionStatus() {
  const { status: wagmiStatus, address } = useAccount();
  const [walletConnectionStatus, setWalletConnectionStatus] =
    useState<WalletConnectionStatus>("idle");
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && wagmiStatus === "disconnected") {
      // On first load, keep it as idle
      return;
    }

    // After we've seen any other status, or after initialization,
    // we'll start tracking the real status
    setWalletConnectionStatus(wagmiStatus);
    setHasInitialized(true);
  }, [wagmiStatus, hasInitialized]);

  return {
    status: walletConnectionStatus,
    isConnecting: walletConnectionStatus === "connecting",
    isConnected: walletConnectionStatus === "connected",
    isDisconnected: walletConnectionStatus === "disconnected",
    isReconnecting: walletConnectionStatus === "reconnecting",
    isIdle: walletConnectionStatus === "idle",
    address: address,
  };
}
