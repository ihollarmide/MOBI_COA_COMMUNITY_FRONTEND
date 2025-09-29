"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useChainId } from "wagmi";
import { Address } from "viem";

type OnConnectHandler = (params: { address: Address; chainId: number }) => void;

export function useWalletOnConnect({
  onConnect,
}: {
  onConnect: OnConnectHandler;
}) {
  const { isConnected, address } = useWalletConnectionStatus();
  const chainId = useChainId();
  const lastConnectionRef = useRef<{
    address: Address;
    chainId: number;
  } | null>(null);

  // Memoize the callback to prevent unnecessary re-renders
  const memoizedOnConnect = useCallback(onConnect, [onConnect]);

  useEffect(() => {
    if (isConnected && address && chainId) {
      const last = lastConnectionRef.current;
      const current = { address, chainId };

      // only fire if new address or new chain
      const changed =
        !last ||
        last.address !== current.address ||
        last.chainId !== current.chainId;

      if (changed) {
        lastConnectionRef.current = current;
        try {
          memoizedOnConnect(current); // ✅ always gives both address + chain
        } catch (error) {
          console.error("Error in wallet onConnect handler:", error);
        }
      }
    }
  }, [isConnected, address, chainId, memoizedOnConnect]);

  // reset on full disconnect
  useEffect(() => {
    if (!isConnected) {
      lastConnectionRef.current = null;
    }
  }, [isConnected]);
}
