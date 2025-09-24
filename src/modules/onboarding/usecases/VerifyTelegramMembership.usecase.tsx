import { post } from "@/lib/api-client";
import {
  VerifySocialPayload,
  VerifySocialResponse,
  VerifyTelegramMembershipPayload,
} from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { updateAuthStatusQuery } from "@/modules/auth/lib/update-auth-query.lib";
import { useSession } from "next-auth/react";

export const verifyTelegram = async (
  payload: VerifyTelegramMembershipPayload
) => {
  try {
    const data = await post<VerifySocialResponse, VerifySocialPayload>({
      url: API_ENDPOINTS.VERIFY.TELEGRAM,
      payload: {
        username: payload.telegramUsername,
      },
    });
    return data;
  } catch (error: unknown) {
    console.error(`Verify Telegram error:`, error);
    const message =
      error instanceof Error ? error.message : `Verify Telegram failed`;
    throw new Error(message);
  }
};

const TOAST_ID = "verify-telegram-membership";

export const useVerifyTelegramMembership = () => {
  const invalidateQueries = useInvalidateQueries();
  const { data: session } = useSession();
  const { update } = useSession();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: verifyTelegram,
    onMutate: () => {
      toast.loading("Verifying your membership...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data, payload) => {
      if (data.data.success) {
        toast.success("Your membership has been verified successfully", {
          id: TOAST_ID,
        });
        updateAuthStatusQuery({
          queryClient,
          payload,
        });
        update({
          ...session,
          user: {
            ...session?.user,
            isTelegramVerified: true,
          },
        });
      } else {
        toast.error("Failed to verify your telegram membership", {
          id: TOAST_ID,
        });
      }
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: () => {
      toast.error("Failed to verify your membership", {
        id: TOAST_ID,
      });
    },
  });

  return mutation;
};
