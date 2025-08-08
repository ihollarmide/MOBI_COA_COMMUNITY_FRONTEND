import { generateAvatarURL } from "@cfx-kit/wallet-avatar";
import { Address } from "viem";
import { useAccount, useConnect } from "wagmi";
import { useWalletConnectionStatus } from "./useWalletConnectionStatus";

export function useWalletIconWithAvatar({
  walletAddress,
}: {
  walletAddress?: Address | null | undefined;
} = {}) {
  const { connector } = useAccount();
  const { connectors } = useConnect();
  const walletConnector = connectors.find((c) => c.id === connector?.id);
  const walletIcon = walletConnector?.icon;
  const { address } = useWalletConnectionStatus();

  const passedAddress = walletAddress ? walletAddress : address;

  const avatarUrl = passedAddress ? generateAvatarURL(passedAddress) : null;
  return {
    walletIcon,
    avatarUrl,
  };
}
