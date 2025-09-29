"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";

type WalletConnectionStatus =
  | "idle"
  | "connected"
  | "disconnected"
  | "connecting"
  | "reconnecting";

export function useWalletConnectionStatus() {
  const { status: wagmiStatus, address } = useAccount();
  const { status: appKitStatus, address: appKitAddress } = useAppKitAccount({
    namespace: "eip155",
  });
  const [walletConnectionStatus, setWalletConnectionStatus] =
    useState<WalletConnectionStatus>("idle");
  const [hasInitialized, setHasInitialized] = useState(false);

  const isWalletLoading =
    walletConnectionStatus === "connecting" ||
    walletConnectionStatus === "reconnecting" ||
    walletConnectionStatus === "idle";

  // useEffect(() => {
  //   console.log({
  //     appKitStatus,
  //     appKitAddress,
  //     wagmiStatus,
  //     wagmiAddress: address,
  //   })
  // }, [appKitStatus, appKitAddress])

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
    isLoading: isWalletLoading,
  };
}
