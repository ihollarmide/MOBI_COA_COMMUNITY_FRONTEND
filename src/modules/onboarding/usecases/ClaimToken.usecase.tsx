import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useWriteContractWithReceipt } from "@/hooks/useWriteContractWithReceipt";
import { toast } from "sonner";
import { useRetrieveClaimParameters } from "./GetClaimParameters.usecase";
import { getNextClaimableTokenId } from "./GetNextClaimableTokenId.usecase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import {
  getIsClaimedKey,
  updateIsClaimedKeyQuery,
} from "./GetIsClaimedKey.usecase";
import { useOnboardingUrlStates } from "../hooks/useOnboardingUrlStates";
import { useChainId } from "wagmi";
import { ADDRESSES } from "@/common/constants/contracts";
import { airdropAbi } from "@/common/contract-abis/airdropAbi";

const TOAST_ID = "claim-token";

export const useClaimToken = () => {
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { address } = useWalletConnectionStatus();
  const { mutate: getClaimParameters, isPending: isGettingClaimParameters } =
    useRetrieveClaimParameters();

  const [, setOnboardingUrlStates] = useOnboardingUrlStates();

  const { mutate: retrieveClaimStatus, isPending: isRetrievingClaimStatus } =
    useMutation({
      mutationFn: getIsClaimedKey,
      onMutate: () => {
        toast.loading("Setting up...", {
          description: "",
          id: TOAST_ID,
        });
      },
      onError: () => {
        toast.error("Unable to claim. Please try again", {
          id: TOAST_ID,
        });
      },
    });

  const {
    mutate: requestNextClaimableTokenId,
    isPending: isRequestingNextClaimableTokenId,
  } = useMutation({
    mutationFn: getNextClaimableTokenId,
    onMutate: () => {
      toast.loading("Claiming Yard Genesis Key...", {
        description: "",
        id: TOAST_ID,
      });
    },
    onError: () => {
      toast.error("Unable to claim. Please try again", {
        id: TOAST_ID,
      });
    },
  });

  const { writeContract: claim, isWritingContractWithReceipt } =
    useWriteContractWithReceipt({
      onMutate() {
        toast.loading("Claiming Yard Genesis Key...", {
          description: "",
          id: TOAST_ID,
        });
      },
      onCompleted() {
        if (!address) {
          toast.error("Please connect your wallet", {
            id: TOAST_ID,
          });
          return;
        }
        updateIsClaimedKeyQuery({
          queryClient,
          payload: {
            isClaimed: true,
            address,
            chainId,
          },
        });
        toast.success("Yard has been claimed successfully", {
          id: TOAST_ID,
        });
        setOnboardingUrlStates((prev) => ({
          ...prev,
          step: "join-vmcc-dao",
        }));
      },
      onWriteContractError(error) {
        console.error(error);
        toast.error("Unable to claim genesis key", {
          description:
            typeof error === "string"
              ? error
              : error?.message || "Unknown error",
          id: TOAST_ID,
        });
      },
      onTransactionReceiptError(error) {
        toast.error(error?.message || "Unable to claim genesis key", {
          id: TOAST_ID,
        });
      },
    });

  const handleClaim = () => {
    if (!address) return;

    retrieveClaimStatus(
      {
        address,
        chainId,
      },
      {
        onSuccess: (isClaimed) => {
          if (isClaimed) {
            toast.success("You have already claimed", {
              id: TOAST_ID,
            });
          } else {
            getClaimParameters(undefined, {
              onSuccess: (claimParameters) => {
                requestNextClaimableTokenId(
                  {
                    chainId,
                  },
                  {
                    onSuccess: (nextTokenId) => {
                      claim({
                        abi: airdropAbi,
                        address: ADDRESSES[chainId].AIRDROP,
                        functionName: "claim",
                        args: [
                          address,
                          claimParameters.data.nftAddress as unknown as Address,
                          BigInt(nextTokenId),
                          BigInt(claimParameters.data.deadline),
                          claimParameters.data.v,
                          claimParameters.data.r as unknown as Address,
                          claimParameters.data.s as unknown as Address,
                        ],
                        // args: [
                        //   "0x517177605394118D4A9d55bd36F48F850C6cF894",
                        //   "0x14D0B4A8aDB4c9d6AE26Cf2723b197c2316d9417",
                        //   BigInt(156),
                        //   BigInt(1754646982),
                        //   27,
                        //   "0xd0e340566db26efcf8d564e552af76b755ee76dbd067e8457c75b178fc5fee9b",
                        //   "0x634f2877443001022b5872ca1ee36eb519b3ef9e7c0d46684b32012007ef9492",
                        // ]
                      });
                    },
                  }
                );
              },
              onError: () => {
                toast.error("Unable to claim", {
                  description: "Please try again",
                  id: TOAST_ID,
                });
              },
            });
          }
        },
      }
    );
  };

  return {
    handleClaim,
    isLoading:
      isRequestingNextClaimableTokenId ||
      isWritingContractWithReceipt ||
      isGettingClaimParameters ||
      isRetrievingClaimStatus,
  };
};
