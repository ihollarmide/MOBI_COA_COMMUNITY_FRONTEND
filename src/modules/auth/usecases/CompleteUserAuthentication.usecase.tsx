import { API_ENDPOINTS } from "@/lib/api-endpoints";
import {
  BaseCompleteAuthenticationPayload,
  CompleteSignatureVerificationBody,
  CompleteUserAuthenticationResponse,
} from "@/modules/auth/types";
import { post } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { AUTH_TOAST_ID } from "@/modules/auth/constants";
import { toast } from "sonner";
import { serializeOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { getUplineId } from "@/modules/onboarding/usecases/GetUplineId.usecase";
import { getIsClaimedKey } from "@/modules/onboarding/usecases/GetIsClaimedKey.usecase";
import { useSecretContext } from "@/modules/auth/context";
import { createSessionInStorage } from "@/modules/auth/lib/session.client";
import { useSessionClientMutation } from "../hooks/useSessionStorage";

export const completeUserAuthentication = async (
  payload: BaseCompleteAuthenticationPayload
) => {
  try {
    const uplineId = await getUplineId({
      address: payload.body.walletAddress,
      chainId: payload.body.chainId,
    });

    const isGenesisClaimed = await getIsClaimedKey({
      address: payload.body.walletAddress,
      chainId: payload.body.chainId,
    });

    const response = await post<
      CompleteUserAuthenticationResponse,
      CompleteSignatureVerificationBody
    >({
      url: API_ENDPOINTS.AUTH.COMPLETE_SIGNATURE_VERIFICATION,
      payload: payload.body,
      isProtected: false,
      config: {
        headers: {
          ...payload.xApiHeaders,
        },
      },
    });

    const restructuredResponse = {
      ...response,
      data: {
        ...response.data,
        user: {
          ...response.data.user,
          uplineId,
          genesisClaimed: isGenesisClaimed,
        },
      },
    };

    const sessionData = {
      walletAddress: payload.body.walletAddress,
      accessToken: restructuredResponse.data.token,
      telegramId: restructuredResponse.data.user.telegramId,
      telegramJoined: restructuredResponse.data.user.telegramJoined,
      telegramUsername: restructuredResponse.data.user.telegramUsername,
      twitterUsername: restructuredResponse.data.user.twitterUsername,
      twitterFollowed: restructuredResponse.data.user.twitterFollowed,
      instagramUsername: restructuredResponse.data.user.instagramUsername,
      instagramFollowed: restructuredResponse.data.user.instagramFollowed,
      phoneNumberVerified: restructuredResponse.data.user.phoneNumberVerified,
      phoneNumber: restructuredResponse.data.user.phoneNumber,
      isFlagged: restructuredResponse.data.user.isFlagged,
      uplineId: restructuredResponse.data.user.uplineId,
      genesisClaimed: restructuredResponse.data.user.genesisClaimed,
      createdAt: restructuredResponse.data.user.createdAt,
      updatedAt: restructuredResponse.data.user.updatedAt,
    };

    if (!payload.sessionSecret) {
      throw new Error("Session secret is required");
    }

    await createSessionInStorage({
      data: sessionData,
      sessionSecret: payload.sessionSecret,
    });

    return restructuredResponse;
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
  const { secretKey: sessionSecret } = useSecretContext();
  const { mutate: getSessionNow, isPending: isGettingSession } =
    useSessionClientMutation();

  const mutation = useMutation({
    mutationFn: (
      payload: Omit<BaseCompleteAuthenticationPayload, "sessionSecret">
    ) =>
      completeUserAuthentication({
        ...payload,
        sessionSecret: sessionSecret,
      }),
    onMutate: () => {
      toast.loading("Completing User Authentication", {
        description: "",
        id: AUTH_TOAST_ID,
      });
    },
    onSuccess: (data) => {
      toast.loading("Completing User Authentication", {
        description: "",
        id: AUTH_TOAST_ID,
      });
      getSessionNow(
        { address: data.data.user.walletAddress },
        {
          onSuccess: (sessionCreated) => {
            toast.success(`User authentication successful`, {
              description: "Redirecting...",
              id: AUTH_TOAST_ID,
            });
            // console.log("sessionCreated: ", sessionCreated);
            const onboardingRoute = "/onboarding";
            if (data.data.user.genesisClaimed) {
              return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
                {
                  step: "join-vmcc-dao",
                }
              )}`);
            } else if (!!data.data.user.uplineId) {
              if (
                !data.data.user.telegramId ||
                !data.data.user.telegramJoined
              ) {
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
              if (
                !data.data.user.telegramId ||
                !data.data.user.telegramJoined
              ) {
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
            } else if (
              data.data.user.telegramId &&
              data.data.user.telegramJoined
            ) {
              return (window.location.href = `${onboardingRoute}${serializeOnboardingUrlStates(
                {
                  step: "follow-us",
                }
              )}`);
            }
            window.location.href = onboardingRoute;
          },
          onError: (error) => {
            toast.error("Unable to create session", {
              id: AUTH_TOAST_ID,
            });
          },
        }
      );
    },
    onError: (error) => {
      toast.error("Error completing authentication", {
        id: AUTH_TOAST_ID,
      });
      console.error("Complete user authentication error:", error);
    },
  });

  return {
    ...mutation,
    isPending: isGettingSession || mutation.isPending,
  };
};
