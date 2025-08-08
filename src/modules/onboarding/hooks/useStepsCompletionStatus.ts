import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { OnboardingStepSlug } from "../types";
import { useGetIsClaimedKey } from "@/modules/onboarding/usecases/GetIsClaimedKey.usecase";
import { useGetAuthStatus } from "@/modules/auth/usecases/GetAuthStatus.usecase";
import { useGetUplineId } from "../usecases/GetUplineId.usecase";

export function useStepsCompletionStatus(): {
  result: Record<OnboardingStepSlug, boolean>;
  isLoading: boolean;
} {
  const { status } = useWalletConnectionStatus();
  const { data: authStatus, isPending: isAuthStatusPending } =
    useGetAuthStatus();
  const { data: isClaimed, isPending: isGettingClaimedStatus } =
    useGetIsClaimedKey();
  const { data: uplineId, isPending: isGettingUplineId } = useGetUplineId();

  return {
    result: {
      "wallet-connected": status === "connected",
      "join-telegram": !!authStatus?.data.telegramJoined,
      "follow-us":
        !!authStatus?.data.twitterFollowed ||
        !!authStatus?.data.instagramFollowed,
      "enter-referral-code": !!uplineId,
      "claim-genesis-key": !!isClaimed,
      "join-vmcc-dao": !!isClaimed,
    },
    isLoading:
      isAuthStatusPending || isGettingUplineId || isGettingClaimedStatus,
  };
}

export function useGetStepToRedirectTo() {
  const { result, isLoading } = useStepsCompletionStatus();

  if (isLoading) return null;

  if (result["claim-genesis-key"]) return "join-vmcc-dao";
  if (result["enter-referral-code"]) return "claim-genesis-key";
  if (result["follow-us"]) return "enter-referral-code";
  if (result["join-telegram"]) return "follow-us";
  if (result["wallet-connected"]) return "join-telegram";

  return null;
}
