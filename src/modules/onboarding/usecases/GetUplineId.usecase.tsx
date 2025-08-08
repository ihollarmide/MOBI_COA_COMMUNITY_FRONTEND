import { referralContract } from "@/common/constants/contracts/referralContract";
import { config } from "@/config/wagmi";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useMutation } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { Address } from "viem";
import { useReadContract } from "wagmi";

export const getUplineId = async (address: Address) => {
  const res = await readContract(config, {
    address: referralContract.address,
    abi: referralContract.abi,
    functionName: "downlineToUplineId",
    args: [address],
  });
  return parseInt(res.toString());
};

export const useGetUplineId = () => {
  const { address } = useWalletConnectionStatus();
  const res = useReadContract({
    address: referralContract.address,
    abi: referralContract.abi,
    functionName: "downlineToUplineId",
    args: !!address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    ...res,
    data: res.data ? parseInt(res.data.toString()) : undefined,
  };
};

export const useRetrieveUplineId = () => {
  const res = useMutation({
    mutationFn: getUplineId,
  });

  return res;
};
