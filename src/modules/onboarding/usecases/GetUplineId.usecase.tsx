import { ADDRESSES } from "@/common/constants/contracts";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { coaAuthContractAbi } from "@/common/contract-abis/coaAuthContractAbi";
import { referralAbi } from "@/common/contract-abis/referralAbi";
import { config } from "@/config/wagmi";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { isZeroAddress } from "@/lib/utils";
import {
  QueryClient,
  skipToken,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { Address } from "viem";
import { useChainId } from "wagmi";

export const getUplineId = async ({
  address,
  chainId,
}: {
  address: Address;
  chainId: number;
}) => {
  try {
    const reffererAddress = await readContract(config, {
      address: ADDRESSES[chainId].REFERRAL,
      abi: referralAbi,
      functionName: "uplines",
      args: [address],
    });

    if (isZeroAddress(reffererAddress)) {
      const res = await readContract(config, {
        address: ADDRESSES[chainId].REFERRAL,
        abi: referralAbi,
        functionName: "downlineToUplineId",
        args: [address],
      });
      return parseInt(res.toString());
    }

    const res = await readContract(config, {
      address: ADDRESSES[chainId].AUTH_CONTRACT,
      abi: coaAuthContractAbi,
      functionName: "walletToUserId",
      args: [reffererAddress],
    });

    return parseInt(res.toString());
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export const useGetUplineId = () => {
  const { address } = useWalletConnectionStatus();
  const chainId = useChainId();
  const res = useQuery({
    queryKey: QUERY_KEYS.UPLINE_ID.list({ address, chainId }),
    queryFn:
      !!address && !!chainId
        ? () => getUplineId({ address, chainId })
        : skipToken,
  });

  return res;
};

export const useRetrieveUplineId = () => {
  const res = useMutation({
    mutationFn: getUplineId,
  });

  return res;
};

export const updateUplineIdQuery = ({
  queryClient,
  payload,
}: {
  queryClient: QueryClient;
  payload: {
    uplineId: number;
    address: Address;
    chainId: number;
  };
}) => {
  // Always update the query data, regardless of whether it exists
  queryClient.setQueryData(
    QUERY_KEYS.UPLINE_ID.list({
      address: payload.address,
      chainId: payload.chainId,
    }),
    payload.uplineId
  );
};
