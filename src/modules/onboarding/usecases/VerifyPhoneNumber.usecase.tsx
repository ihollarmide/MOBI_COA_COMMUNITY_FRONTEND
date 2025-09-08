import { post } from "@/lib/api-client";
import { VerifyPhoneVerificationPayload } from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";
import { QUERY_KEYS } from "@/common/constants/query-keys";

export const verifyPhoneNumber = async (
  payload: VerifyPhoneVerificationPayload
) => {
  try {
    const data = await post<unknown, VerifyPhoneVerificationPayload>({
      url: API_ENDPOINTS.VERIFY.VERIFY_OTP,
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

const TOAST_ID = "verify-phone-number";

export const useVerifyPhoneNumber = () => {
  const invalidateQueries = useInvalidateQueries();
  const mutation = useMutation({
    mutationFn: verifyPhoneNumber,
    onMutate: () => {
      toast.loading("Verifying your phone number...", {
        id: TOAST_ID,
      });
    },
    onSuccess: () => {
      toast.success("Phone number verified successfully", {
        description: "",
        id: TOAST_ID,
      });
      // if (data.data.success) {
      //   toast.success("Your Twitter account has been verified successfully", {
      //     id: TOAST_ID,
      //   });
      //   updateAuthStatusQuery({
      //     queryClient,
      //     payload: {
      //       twitterFollowed: true,
      //       twitterUsername: payload.username,
      //       twitterId: payload.twitterId,
      //       tweetLink: payload.tweetLink,
      //     },
      //   });
      // } else {
      //   toast.error("Failed to verify your Twitter account", {
      //     id: TOAST_ID,
      //   });
      // }
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: () => {
      toast.error("Failed to verify your phone number", {
        id: TOAST_ID,
      });
    },
  });

  return mutation;
};
