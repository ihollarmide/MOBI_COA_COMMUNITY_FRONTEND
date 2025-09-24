import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { OnboardingStepSlug } from "@/modules/onboarding/types";
import { useGetIsClaimedKey } from "@/modules/onboarding/usecases/GetIsClaimedKey.usecase";
import { useGetAuthStatus } from "@/modules/auth/usecases/GetAuthStatus.usecase";
import { useGetUplineId } from "@/modules/onboarding/usecases/GetUplineId.usecase";
import { useSession } from "next-auth/react";

export function useStepsCompletionStatus(): {
  result: Record<OnboardingStepSlug, boolean>;
  isLoading: boolean;
} {
  const { status: sessionStatus, data: sessionData } = useSession();
  const {
    status,
    isLoading: isWalletLoading,
    address: walletAddress,
  } = useWalletConnectionStatus();
  const { data: authStatus, isPending: isAuthStatusPending } = useGetAuthStatus(
    {
      isEnabled: sessionStatus === "authenticated",
    }
  );
  const { data: isClaimed, isPending: isGettingClaimedStatus } =
    useGetIsClaimedKey();
  const { data: uplineId, isPending: isGettingUplineId } = useGetUplineId();

  const isWalletConnected =
    status === "connected" &&
    !!walletAddress &&
    walletAddress.toLowerCase() ===
      sessionData?.user?.walletAddress?.toLowerCase();

  return {
    result: {
      "wallet-connected": isWalletConnected,
      "join-telegram":
        !!authStatus?.data.telegramId && !!authStatus?.data.telegramJoined,
      "follow-us":
        !!authStatus?.data.twitterUsername &&
        !!authStatus?.data.tweetLink &&
        !!authStatus?.data.twitterId,
      "enter-referral-code": !!uplineId,
      "claim-genesis-key": !!isClaimed,
      "join-vmcc-dao": !!isClaimed,
    },
    isLoading:
      isAuthStatusPending ||
      isGettingUplineId ||
      isGettingClaimedStatus ||
      sessionStatus === "loading" ||
      isWalletLoading,
  };
}

export function useGetStepToRedirectTo() {
  const { result, isLoading } = useStepsCompletionStatus();

  if (isLoading) return null;

  if (result["claim-genesis-key"]) return "join-vmcc-dao";
  if (result["enter-referral-code"]) return "claim-genesis-key";
  if (result["follow-us"]) return "enter-referral-code";
  if (result["join-telegram"]) return "follow-us";
  // if (result["verify-phone-number"]) return "join-telegram";
  if (result["wallet-connected"]) return "join-telegram";

  return null;
}
