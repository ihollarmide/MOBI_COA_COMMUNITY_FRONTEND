import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useWriteContractWithReceipt } from "@/hooks/useWriteContractWithReceipt";
import { toast } from "sonner";
import { useRetrieveClaimParameters } from "./GetClaimParameters.usecase";
import { getNextClaimableTokenId } from "./GetNextClaimableTokenId.usecase";
import { airdropContract } from "@/common/constants/contracts/airdropContract";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { getIsClaimedKey, useGetIsClaimedKey } from "./GetIsClaimedKey.usecase";

const TOAST_ID = "claim-token";

export const useClaimToken = () => {
  const { address } = useWalletConnectionStatus();
  const { mutate: getClaimParameters, isPending: isGettingClaimParameters } =
    useRetrieveClaimParameters();

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

  const { refetch: refreshIsClaimedKey } = useGetIsClaimedKey();

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
        refreshIsClaimedKey();
        toast.success("Acre has been claimed successfully", {
          id: TOAST_ID,
        });
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
      onBlockError(error) {
        toast.error(error?.message || "Unable to claim genesis key", {
          id: TOAST_ID,
        });
      },
    });

  const handleClaim = () => {
    if (!address) return;

    retrieveClaimStatus(address, {
      onSuccess: (isClaimed) => {
        if (isClaimed) {
          toast.success("You have already claimed", {
            id: TOAST_ID,
          });
        } else {
          getClaimParameters(undefined, {
            onSuccess: (claimParameters) => {
              requestNextClaimableTokenId(undefined, {
                onSuccess: (nextTokenId) => {
                  claim({
                    abi: airdropContract.abi,
                    address: airdropContract.address,
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
                  });
                },
              });
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
    });
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
