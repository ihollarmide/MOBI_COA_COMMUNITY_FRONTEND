import { ADDRESSES } from "@/common/constants/contracts";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { airdropAbi } from "@/common/contract-abis/airdropAbi";
import { config } from "@/config";
import { getEthersProvider } from "@/providers/ethers-provider";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { QueryClient, skipToken, useQuery } from "@tanstack/react-query";
import { Contract } from "ethers";
import { Address } from "viem";
import { useChainId } from "wagmi";

export const getIsClaimedKey = async ({
  address,
  chainId,
}: {
  address: Address;
  chainId: number;
}) => {
  const provider = getEthersProvider(config, { chainId });
  if (!provider) {
    throw new Error(`No provider found for chainId: ${chainId}`);
  }

  const contract = new Contract(
    ADDRESSES[chainId].AIRDROP,
    airdropAbi,
    provider
  );
  const res: boolean = await contract.hasClaimed(address);
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
