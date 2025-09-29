import { post } from "@/lib/api-client";
import { RequestPhoneVerificationPayload } from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const requestPhoneNumberVerification = async (
  payload: RequestPhoneVerificationPayload
) => {
  try {
    const data = await post<unknown, RequestPhoneVerificationPayload>({
      url: API_ENDPOINTS.VERIFY.REQUEST_OTP,
      payload: payload,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Unable to request OTP:`, error);
    const message =
      error instanceof Error ? error.message : `Unable to request OTP`;
    throw new Error(message);
  }
};

const TOAST_ID = "request-phone-number-verification";

export const useRequestPhoneNumberVerification = () => {
  const mutation = useMutation({
    mutationFn: requestPhoneNumberVerification,
    onMutate: () => {
      toast.loading("Requesting OTP...", {
        description: "",
        id: TOAST_ID,
      });
    },
    onSuccess: () => {
      toast.success("OTP sent successfully", {
        description: "Please check your whatsapp for the OTP",
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
      // invalidateQueries({
      //   queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      // });
    },
    onError: () => {
      toast.error("Failed to request OTP", {
        description: "",
        id: TOAST_ID,
      });
    },
  });

  return mutation;
};
