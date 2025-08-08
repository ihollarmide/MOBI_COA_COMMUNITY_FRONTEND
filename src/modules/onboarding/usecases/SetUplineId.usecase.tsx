import { useWriteContractWithReceipt } from "@/hooks/useWriteContractWithReceipt";
import { toast } from "sonner";
import { Address } from "viem";
import {
  updateUplineIdQuery,
  useGetUplineId,
  useRetrieveUplineId,
} from "./GetUplineId.usecase";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useChainId } from "wagmi";
import { referralAbi } from "@/common/contract-abis/referralAbi";
import { ADDRESSES } from "@/common/constants/contracts";

const TOAST_ID = "set-upline-id";

export const useSetUplineId = ({
  onSuccess,
  onError,
  onGenericError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onGenericError?: (error: unknown) => void;
}) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { address } = useWalletConnectionStatus();
  const [uplineId, setUplineId] = useState<string | number | null>(null);
  const { refetch: refreshGetUplineId } = useGetUplineId();
  const {
    mutate: retrieveExistingUplineId,
    isPending: isRetrievingExistingUplineId,
  } = useRetrieveUplineId();
  const {
    writeContract: setUpline,
    isWritingContractWithReceipt: isSettingUpline,
    ...rest
  } = useWriteContractWithReceipt({
    onMutate() {
      toast.loading("Applying Referral Code...", {
        description: "",
        id: TOAST_ID,
      });
    },
    onCompleted() {
      if (uplineId && address) {
        updateUplineIdQuery({
          queryClient: queryClient,
          payload: {
            uplineId: parseInt(uplineId.toString()),
            address: address,
            chainId,
          },
        });
      } else {
        refreshGetUplineId();
      }

      toast.success("Your Referral code has been successfully applied", {
        id: TOAST_ID,
      });
      onSuccess?.();
    },
    onWriteContractError(error) {
      console.error(error);
      toast.error("Unable to apply referral code", {
        description:
          typeof error === "string" ? error : error?.message || "Unknown error",
        id: TOAST_ID,
      });
      onError?.(error);
    },
    onTransactionReceiptError(error) {
      toast.error("Unable to apply referral code", {
        description:
          typeof error === "string" ? error : error?.message || "Unknown error",
        id: TOAST_ID,
      });
      onGenericError?.(error);
    },
  });

  const handleSetUpline = ({
    coaUserId,
    address,
  }: {
    coaUserId: string | number;
    address: Address;
  }) => {
    setUplineId(coaUserId);
    toast.loading("Setting up referral code...", {
      description: "",
      id: TOAST_ID,
    });
    retrieveExistingUplineId(
      {
        address,
        chainId,
      },
      {
        onSuccess: (existingUplineId) => {
          if (!!existingUplineId) {
            toast.error("You have already applied a referral code", {
              id: TOAST_ID,
            });
          } else {
            setUpline({
              abi: referralAbi,
              address: ADDRESSES[chainId].REFERRAL,
              functionName: "setUplinePublic",
              args: [address, BigInt(coaUserId)],
            });
          }
        },
      }
    );
  };

  return {
    ...rest,
    handleSetUpline,
    isLoading: isSettingUpline || isRetrievingExistingUplineId,
  };
};
