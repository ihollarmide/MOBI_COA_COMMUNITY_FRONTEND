import { ADDRESSES } from "@/common/constants/contracts";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { airdropAbi } from "@/common/contract-abis/airdropAbi";
import { config } from "@/config/wagmi";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { QueryClient, skipToken, useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { Address } from "viem";
import { useChainId } from "wagmi";

export const getIsClaimedKey = async ({
  address,
  chainId,
}: {
  address: Address;
  chainId: number;
}) => {
  console.log("address", address);
  console.log("chainId", chainId);
  const clientChainId = config.getClient().chain;
  console.log("clientChainId", clientChainId);
  const res = await readContract(config, {
    chainId,
    address: ADDRESSES[chainId].AIRDROP,
    abi: airdropAbi,
    functionName: "hasClaimed",
    args: [address],
  });
  return res;
};

export const useGetIsClaimedKey = () => {
  const chainId = useChainId();
  const { address } = useWalletConnectionStatus();

  const res = useQuery({
    queryKey: QUERY_KEYS.IS_CLAIMED_KEY.list({ address, chainId }),
    queryFn:
      !!address && !!chainId
        ? () => getIsClaimedKey({ address, chainId })
        : skipToken,
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
    chainId: number;
  };
}) => {
  // Always update the query data, regardless of whether it exists
  queryClient.setQueryData(
    QUERY_KEYS.IS_CLAIMED_KEY.list({
      address: payload.address,
      chainId: payload.chainId,
    }),
    payload.isClaimed
  );
};
