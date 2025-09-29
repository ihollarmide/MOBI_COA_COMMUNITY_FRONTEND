import { post } from "@/lib/api-client";
import { VerifySocialResponse, VerifyTweetPayload } from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { updateAuthStatusQuery } from "@/modules/auth/lib/update-auth-query.lib";

export const verifyTweet = async (payload: VerifyTweetPayload) => {
  try {
    const data = await post<VerifySocialResponse, VerifyTweetPayload>({
      url: API_ENDPOINTS.VERIFY.TWEET,
      payload: payload,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Tweet verification error:`, error);
    const message =
      error instanceof Error ? error.message : `Tweet verification failed`;
    throw new Error(message);
  }
};

const TOAST_ID = "verify-tweet";

export const useVerifyTweet = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = useInvalidateQueries();
  const mutation = useMutation({
    mutationFn: verifyTweet,
    onMutate: () => {
      toast.loading("Verifying your Twitter account...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data, payload) => {
      toast.success("Your Tweet has been verified successfully", {
        id: TOAST_ID,
        description: "",
      });
      updateAuthStatusQuery({
        queryClient,
        payload: {
          tweetLink: payload.tweetLink,
        },
      });
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: (error) => {
      toast.error("Failed to verify your Tweet", {
        description: error.message,
        id: TOAST_ID,
        duration: 15000,
      });
    },
  });

  return mutation;
};
