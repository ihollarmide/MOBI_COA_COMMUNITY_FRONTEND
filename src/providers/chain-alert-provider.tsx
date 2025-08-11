"use client";

import { useEffect } from "react";
import { useChainId } from "wagmi";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { toast } from "sonner";

const TOAST_ID = "chain-alert";

export function ChainAlertProvider() {
  const chainId = useChainId();
  const { status } = useWalletConnectionStatus();

  const preferredChainId =
    process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? 56 : 84532;
  const chainName =
    process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
      ? "BNB Smart Chain"
      : "Base Sepolia";

  useEffect(() => {
    if (
      status === "connected" &&
      !!chainId &&
      chainId?.toString() !== preferredChainId.toString()
    ) {
      toast.error("Wrong Network Chain Detected", {
        description: `Please switch to the correct chain ${chainName}(${preferredChainId})`,
        id: TOAST_ID,
      });
    } else {
      toast.dismiss(TOAST_ID);
    }
  }, [chainId, status, chainName, preferredChainId]);

  return null;
}
