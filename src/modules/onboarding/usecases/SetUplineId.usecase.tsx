import { useWriteContractWithReceipt } from "@/hooks/useWriteContractWithReceipt";
import { toast } from "sonner";
import { referralContract } from "@/common/constants/contracts/referralContract";
import { Address } from "viem";
import { useGetUplineId, useRetrieveUplineId } from "./GetUplineId.usecase";

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
      refreshGetUplineId();
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
    onBlockError(error) {
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
    toast.loading("Setting up referral code...", {
      description: "",
      id: TOAST_ID,
    });
    retrieveExistingUplineId(address, {
      onSuccess: (existingUplineId) => {
        if (!!existingUplineId) {
          toast.error("You have already applied a referral code", {
            id: TOAST_ID,
          });
        } else {
          setUpline({
            abi: referralContract.abi,
            address: referralContract.address,
            functionName: "setUplinePublic",
            args: [address, BigInt(coaUserId)],
          });
        }
      },
    });
  };

  return {
    ...rest,
    handleSetUpline,
    isLoading: isSettingUpline || isRetrievingExistingUplineId,
  };
};
