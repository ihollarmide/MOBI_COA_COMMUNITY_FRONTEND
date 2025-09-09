import { ADDRESSES } from "@/common/constants/contracts";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { coaAuthContractAbi } from "@/common/contract-abis/coaAuthContractAbi";
import { referralAbi } from "@/common/contract-abis/referralAbi";
import { config } from "@/config/wagmi";
import { getEthersProvider } from "@/providers/ethers-provider";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { isZeroAddress } from "@/lib/utils";
import {
  QueryClient,
  skipToken,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Contract } from "ethers";
import { Address } from "viem";
import { useChainId } from "wagmi";

export const getUplineId = async ({
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

  try {
    const referralContract = new Contract(
      ADDRESSES[chainId].REFERRAL,
      referralAbi,
      provider
    );
    const reffererAddress: Address = await referralContract.uplines(address);

    if (isZeroAddress(reffererAddress)) {
      const res: bigint = await referralContract.downlineToUplineId(address);
      return parseInt(res.toString());
    }

    const authContract = new Contract(
      ADDRESSES[chainId].AUTH_CONTRACT,
      coaAuthContractAbi,
      provider
    );
    const res: bigint = await authContract.walletToUserId(reffererAddress);
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
