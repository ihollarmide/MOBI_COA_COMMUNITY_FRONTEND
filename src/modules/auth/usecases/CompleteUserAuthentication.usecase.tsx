import { API_ENDPOINTS } from "@/lib/api-endpoints";
import {
  BaseCompleteAuthenticationPayload,
  CompleteAuthenticationPayload,
  CompleteUserAuthenticationResponse,
} from "@/modules/auth/types";
import { post } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { AUTH_TOAST_ID } from "@/modules/auth/constants";
import { toast } from "sonner";
import { serializeOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { getUplineId } from "@/modules/onboarding/usecases/GetUplineId.usecase";
import { getIsClaimedKey } from "@/modules/onboarding/usecases/GetIsClaimedKey.usecase";

export const completeUserAuthentication = async (
  payload: BaseCompleteAuthenticationPayload
) => {
  try {
    const uplineId = await getUplineId({
      address: payload.body.walletAddress,
      chainId: payload.body.chainId,
    });

    console.log("uplineId", uplineId);

    const isGenesisClaimed = await getIsClaimedKey({
      address: payload.body.walletAddress,
      chainId: payload.body.chainId,
    });

    console.log("isGenesisClaimed", isGenesisClaimed);

    const data = await post<
      CompleteUserAuthenticationResponse,
      CompleteAuthenticationPayload
    >({
      url: API_ENDPOINTS.AUTH.COMPLETE_USER_AUTHENTICATION,
      payload: {
        ...payload,
        extras: {
          uplineId,
          isGenesisClaimed,
        },
      },
      isProtected: false,
      config: {
        baseURL: process.env.NEXT_PUBLIC_APP_URL,
      },
    });
    return data;
  } catch (error: unknown) {
    console.error(`Complete user authentication error:`, error);
    const message =
      error instanceof Error
        ? error.message
        : `Complete user authentication failed`;
    throw new Error(message);
  }
};

export const useCompleteUserAuthentication = () => {
  const mutation = useMutation({
    mutationFn: completeUserAuthentication,
    onMutate: () => {
      toast.loading("Completing User Authentication", {
        description: "",
        id: AUTH_TOAST_ID,
      });
    },
    onSuccess: (data) => {
      toast.success(`User authentication successful`, {
        description: "Redirecting...",
        id: AUTH_TOAST_ID,
      });
      const onboardingRoute = "/onboarding";
      if (data.data.user.genesisClaimed) {
        return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
          {
            step: "join-vmcc-dao",
          }
        )}`);
      } else if (!!data.data.user.uplineId) {
        // if (!data.data.user.phoneNumberVerified) {
        //   return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
        //     {
        //       step: "verify-phone-number",
        //     }
        //   )}`);
        // }

        if (!data.data.user.telegramId || !data.data.user.telegramJoined) {
          return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
            {
              step: "join-telegram",
            }
          )}`);
        }

        if (
          !data.data.user.twitterUsername ||
          !data.data.user.twitterFollowed ||
          !data.data.user.tweetLink ||
          !data.data.user.twitterId
        ) {
          return (window.location.href = `${onboardingRoute}
              ${serializeOnboardingUrlStates({
                step: "follow-us",
              })}`);
        }

        return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
          {
            step: "claim-genesis-key",
          }
        )}`);
      } else if (
        data.data.user.twitterUsername &&
        data.data.user.twitterFollowed
      ) {
        if (!data.data.user.telegramId || !data.data.user.telegramJoined) {
          return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
            {
              step: "join-telegram",
            }
          )}`);
        }

        return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
          {
            step: "enter-referral-code",
          }
        )}`);
      } else if (data.data.user.telegramId && data.data.user.telegramJoined) {
        return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
          {
            step: "follow-us",
          }
        )}`);
      }
      window.location.href = onboardingRoute;
    },
    onError: (error) => {
      toast.error("Error completing authentication", {
        id: AUTH_TOAST_ID,
      });
      console.error("Complete user authentication error:", error);
    },
  });

  return mutation;
};
