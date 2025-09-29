import { serializeOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { CompleteUserAuthenticationResponse, UserSession } from "../types";

export const getRedirectRouteOnSignin = (
  data: CompleteUserAuthenticationResponse
): string => {
  const onboardingRoute = "/onboarding";
  if (data.data.user.genesisClaimed) {
    return `${onboardingRoute}${serializeOnboardingUrlStates({
      step: "join-vmcc-dao",
    })}`;
  } else if (!!data.data.user.uplineId) {
    if (!data.data.user.telegramId || !data.data.user.telegramJoined) {
      return (
        onboardingRoute +
        serializeOnboardingUrlStates({
          step: "join-telegram",
        })
      );
    }

    if (
      !data.data.user.twitterUsername ||
      !data.data.user.twitterFollowed ||
      !data.data.user.tweetLink ||
      !data.data.user.twitterId
    ) {
      return (
        onboardingRoute +
        serializeOnboardingUrlStates({
          step: "follow-us",
        })
      );
    }

    return (
      onboardingRoute +
      serializeOnboardingUrlStates({
        step: "claim-genesis-key",
      })
    );
  } else if (data.data.user.twitterUsername && data.data.user.twitterFollowed) {
    if (!data.data.user.telegramId || !data.data.user.telegramJoined) {
      return (
        onboardingRoute +
        serializeOnboardingUrlStates({
          step: "join-telegram",
        })
      );
    }

    return (
      onboardingRoute +
      serializeOnboardingUrlStates({
        step: "enter-referral-code",
      })
    );
  } else if (data.data.user.telegramId && data.data.user.telegramJoined) {
    return (
      onboardingRoute +
      serializeOnboardingUrlStates({
        step: "follow-us",
      })
    );
  }

  return onboardingRoute;
};

export const getCompleteSignPayloadFromAuthResponse = (
  data: CompleteUserAuthenticationResponse
): UserSession => {
  return {
    id: data?.data?.user?.id ? data?.data?.user?.id.toString() : "",
    walletAddress: data.data.user.walletAddress,
    accessToken: data.data.token,
    isGenesisClaimed: data.data.user.genesisClaimed,
    isFlagged: data.data.user.isFlagged,
    isTelegramVerified:
      !!data.data.user.telegramId &&
      !!data.data.user.telegramUsername &&
      !!data.data.user.telegramJoined,
    isInstagramVerified: !!data.data.user.instagramUsername,
    uplineId: data.data.user.uplineId,
    isTwitterVerified:
      !!data.data.user.tweetLink &&
      !!data.data.user.twitterUsername &&
      !!data.data.user.twitterId,
  };
};
