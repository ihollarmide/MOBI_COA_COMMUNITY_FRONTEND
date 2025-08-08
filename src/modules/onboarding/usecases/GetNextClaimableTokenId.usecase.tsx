import { airdropContract } from "@/common/constants/contracts/airdropContract";
import { config } from "@/config/wagmi";
import { readContract } from "@wagmi/core";
import { useReadContract } from "wagmi";

export const getNextClaimableTokenId = async () => {
  const res = await readContract(config, {
    address: airdropContract.address,
    abi: airdropContract.abi,
    functionName: "currentTokenID",
  });
  return parseInt(res.toString());
};

export const useGetNextClaimableTokenId = () => {
  const res = useReadContract({
    address: airdropContract.address,
    abi: airdropContract.abi,
    functionName: "currentTokenID",
  });

  return {
    ...res,
    data: res.data ? parseInt(res.data.toString()) : undefined,
  };
};
