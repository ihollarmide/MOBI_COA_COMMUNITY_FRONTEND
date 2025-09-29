import { post } from "@/lib/api-client";
import {
  VerifyTwitterPayload,
  VerifyTwitterResponse,
} from "@/modules/onboarding/types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { updateAuthStatusQuery } from "@/modules/auth/lib/update-auth-query.lib";

export const verifyTwitter = async (payload: VerifyTwitterPayload) => {
  try {
    const data = await post<VerifyTwitterResponse, VerifyTwitterPayload>({
      url: API_ENDPOINTS.VERIFY.TWITTER,
      payload: payload,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Twitter verification error:`, error);
    const message =
      error instanceof Error ? error.message : `Twitter verification failed`;
    throw new Error(message);
  }
};

const TOAST_ID = "verify-twitter";

export const useVerifyTwitter = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = useInvalidateQueries();
  const mutation = useMutation({
    mutationFn: verifyTwitter,
    onMutate: () => {
      toast.loading("Verifying your Twitter account...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data, payload) => {
      toast.success("Your Twitter account has been verified successfully", {
        description: "",
        id: TOAST_ID,
      });
      updateAuthStatusQuery({
        queryClient,
        payload: {
          twitterUsername: payload.username,
          twitterId: payload.twitterId,
        },
      });
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: (error) => {
      toast.error("Failed to verify your Twitter account", {
        description: error.message,
        id: TOAST_ID,
        duration: 15000,
      });
    },
  });

  return mutation;
};
