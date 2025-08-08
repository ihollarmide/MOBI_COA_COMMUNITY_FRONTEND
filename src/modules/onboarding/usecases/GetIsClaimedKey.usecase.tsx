import { airdropContract } from "@/common/constants/contracts/airdropContract";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { config } from "@/config/wagmi";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { QueryClient, skipToken, useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { Address } from "viem";

export const getIsClaimedKey = async (address: Address) => {
  const res = await readContract(config, {
    address: airdropContract.address,
    abi: airdropContract.abi,
    functionName: "hasClaimed",
    args: [address],
  });
  return res;
};

export const useGetIsClaimedKey = () => {
  const { address } = useWalletConnectionStatus();

  const res = useQuery({
    queryKey: QUERY_KEYS.IS_CLAIMED_KEY.detail(address ?? ""),
    queryFn: !!address ? () => getIsClaimedKey(address) : skipToken,
  });

  return res;
};

export const updateIsClaimedKeyQuery = ({
  queryClient,
  payload,
}: {
  queryClient: QueryClient;
  payload: {
    isClaimed: boolean;
    address: Address;
  };
}) => {
  // Always update the query data, regardless of whether it exists
  queryClient.setQueryData(
    QUERY_KEYS.IS_CLAIMED_KEY.detail(payload.address ?? ""),
    payload.isClaimed
  );
};
