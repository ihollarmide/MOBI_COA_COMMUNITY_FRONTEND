import { ADDRESSES } from "@/common/constants/contracts";
import { airdropAbi } from "@/common/contract-abis/airdropAbi";
import { config } from "@/config";
import { readContract } from "@wagmi/core";
import { useChainId, useReadContract } from "wagmi";

export const getNextClaimableTokenId = async ({
  chainId,
}: {
  chainId: number;
}) => {
  const res = await readContract(config, {
    address: ADDRESSES[chainId].AIRDROP,
    abi: airdropAbi,
    functionName: "currentTokenID",
  });
  return parseInt(res.toString());
};

export const useGetNextClaimableTokenId = () => {
  const chainId = useChainId();
  const res = useReadContract({
    address: ADDRESSES[chainId].AIRDROP,
    abi: airdropAbi,
    functionName: "currentTokenID",
  });

  return {
    ...res,
    data: res.data ? parseInt(res.data.toString()) : undefined,
  };
};
