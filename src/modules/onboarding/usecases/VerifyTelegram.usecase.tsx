import { post } from "@/lib/api-client";
import { VerifySocialPayload, VerifySocialResponse } from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { updateAuthStatusQuery } from "@/modules/auth/lib/update-auth-query.lib";

export const verifyTelegram = async (payload: VerifySocialPayload) => {
  try {
    const data = await post<VerifySocialResponse, VerifySocialPayload>({
      url: API_ENDPOINTS.VERIFY.TELEGRAM,
      payload: payload,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Verify Telegram error:`, error);
    const message =
      error instanceof Error ? error.message : `Verify Telegram failed`;
    throw new Error(message);
  }
};

const TOAST_ID = "verify-instagram";

export const useVerifyTelegram = () => {
  const invalidateQueries = useInvalidateQueries();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: verifyTelegram,
    onMutate: () => {
      toast.loading("Verifying your Telegram account...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data) => {
      if (data.data.success) {
        toast.success("Your Telegram account has been verified successfully", {
          id: TOAST_ID,
        });
        updateAuthStatusQuery({
          queryClient,
          payload: {
            telegramJoined: true,
          },
        });
      } else {
        toast.error("Failed to verify your Telegram account", {
          id: TOAST_ID,
        });
      }
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: () => {
      toast.error("Failed to verify your Telegram account", {
        id: TOAST_ID,
      });
    },
  });

  return mutation;
};
