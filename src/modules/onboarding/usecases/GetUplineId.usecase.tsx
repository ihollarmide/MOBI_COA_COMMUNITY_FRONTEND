import { coaAuthContract } from "@/common/constants/contracts/coaAuthContract";
import { referralContract } from "@/common/constants/contracts/referralContract";
import { QUERY_KEYS } from "@/common/constants/query-keys";
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

export const getUplineId = async (address: Address) => {
  const reffererAddress = await readContract(config, {
    address: referralContract.address,
    abi: referralContract.abi,
    functionName: "uplines",
    args: [address],
  });

  if (isZeroAddress(reffererAddress)) {
    const res = await readContract(config, {
      address: referralContract.address,
      abi: referralContract.abi,
      functionName: "downlineToUplineId",
      args: [address],
    });
    return parseInt(res.toString());
  }

  const res = await readContract(config, {
    address: coaAuthContract.address,
    abi: coaAuthContract.abi,
    functionName: "walletToUserId",
    args: [reffererAddress],
  });

  return parseInt(res.toString());
};

export const useGetUplineId = () => {
  const { address } = useWalletConnectionStatus();
  const res = useQuery({
    queryKey: QUERY_KEYS.UPLINE_ID.detail(address ?? ""),
    queryFn: !!address ? () => getUplineId(address) : skipToken,
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
  };
}) => {
  // Always update the query data, regardless of whether it exists
  queryClient.setQueryData(
    QUERY_KEYS.UPLINE_ID.detail(payload.address ?? ""),
    payload.uplineId
  );
};
