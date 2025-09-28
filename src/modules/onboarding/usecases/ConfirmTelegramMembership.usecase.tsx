import { post } from "@/lib/api-client";
import { VerifySocialResponse } from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { updateAuthStatusQuery } from "@/modules/auth/lib/update-auth-query.lib";
import { useSession } from "next-auth/react";
import { EmptyObject } from "react-hook-form";

export const confirmTelegramMembership = async () => {
  try {
    const data = await post<VerifySocialResponse, EmptyObject>({
      url: API_ENDPOINTS.VERIFY.TELEGRAM,
      payload: {},
    });
    return data;
  } catch (error: unknown) {
    console.error(`Confirm Telegram membership error:`, error);
    const message =
      error instanceof Error ? error.message : `Verify Telegram failed`;
    throw new Error(message);
  }
};

const TOAST_ID = "confirm-telegram-membership";

export const useConfirmTelegramMembership = () => {
  const invalidateQueries = useInvalidateQueries();
  const { data: session } = useSession();
  const { update } = useSession();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: confirmTelegramMembership,
    onMutate: () => {
      toast.loading("Confirming your membership...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data) => {
      if (data.data.success) {
        toast.success("Your membership has been confirmed successfully", {
          id: TOAST_ID,
        });
        updateAuthStatusQuery({
          queryClient,
          payload: {
            telegramJoined: true,
          },
        });
        update({
          ...session,
          user: {
            ...session?.user,
            isTelegramVerified: true,
          },
        });
      } else {
        toast.error("Failed to confirm your telegram membership", {
          id: TOAST_ID,
        });
      }
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: () => {
      toast.error("Failed to confirm your membership", {
        id: TOAST_ID,
      });
    },
  });

  return mutation;
};
