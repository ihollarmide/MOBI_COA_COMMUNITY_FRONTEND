import { airdropContract } from "@/common/constants/contracts/airdropContract";
import { config } from "@/config/wagmi";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { readContract } from "@wagmi/core";
import { Address } from "viem";
import { useReadContract } from "wagmi";

export const getIsClaimedKey = async (address: Address) => {
  const res = await readContract(config, {
    address: airdropContract.address,
    abi: airdropContract.abi,
    functionName: "hasClaimed",
    args: [address],
  });
  return !!parseInt(res.toString());
};

export const useGetIsClaimedKey = () => {
  const { address } = useWalletConnectionStatus();
  const res = useReadContract({
    address: airdropContract.address,
    abi: airdropContract.abi,
    functionName: "hasClaimed",
    args: !!address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    ...res,
    data: res.data ? !!parseInt(res.data.toString()) : undefined,
  };
};
