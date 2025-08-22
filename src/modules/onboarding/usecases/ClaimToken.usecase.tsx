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
import { useChainId, useDisconnect } from "wagmi";
import { ADDRESSES } from "@/common/constants/contracts";
import { airdropAbi } from "@/common/contract-abis/airdropAbi";
import { signOut, useSession } from "next-auth/react";

const TOAST_ID = "claim-token";

export const useClaimToken = () => {
  const { data: session } = useSession();
  const { disconnectAsync } = useDisconnect({
    mutation: {
      onSettled() {
        signOut({
          redirect: true,
          redirectTo: "/welcome",
        });
      },
    },
  });

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

  const handleClaim = async () => {
    if (!address) return;

    if (!session) {
      toast.error("Please sign in again", {
        id: TOAST_ID,
        description: "You will be redirected to the welcome page",
      });
      signOut({
        redirect: true,
        redirectTo: "/welcome",
      });
      return;
    }

    if (session?.user?.walletAddress.toLowerCase() !== address.toLowerCase()) {
      toast.error("Session mismatch with wallet address", {
        id: TOAST_ID,
        description: "Please reconnect your wallet and sign in again",
      });
      await disconnectAsync();
      return;
    }

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
