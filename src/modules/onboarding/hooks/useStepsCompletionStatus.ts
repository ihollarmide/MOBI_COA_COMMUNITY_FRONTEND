import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { OnboardingStepSlug } from "../types";
import { useSessionStorage } from "@/shared/hooks";
import { getTelegramUserVerifiedKey } from "../lib/utils";
import { useChainId } from "wagmi";

export function useStepsCompletionStatus(): Record<
  OnboardingStepSlug,
  boolean
> {
  const chainId = useChainId();
  const { address } = useWalletConnectionStatus();
  const { status } = useWalletConnectionStatus();
  const { value: telegramUserVerified } = useSessionStorage(
    getTelegramUserVerifiedKey({
      chainId,
      address: address ?? "",
    })
  );

  return {
    "wallet-connected": status === "connected",
    // "join-telegram": onboardingUrlStates.step === "join-telegram",
    // "follow-us": onboardingUrlStates.step === "follow-us",
    // "enter-referral-code": onboardingUrlStates.step === "enter-referral-code",
    // "claim-genesis-key": onboardingUrlStates.step === "claim-genesis-key",
    // "join-vmcc-dao": onboardingUrlStates.step === "join-vmcc-dao",
    "join-telegram": telegramUserVerified === true,
    "follow-us": false,
    "enter-referral-code": false,
    "claim-genesis-key": false,
    "join-vmcc-dao": false,
  };
}
