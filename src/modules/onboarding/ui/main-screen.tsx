"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { OnboardingNav } from "./onboarding-nav";
import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import { useOnboardingUrlStates } from "../hooks/useOnboardingUrlStates";
import { WalletConnected } from "./wallet-connected";
import { JoinTelegramCommunity } from "./join-telegram-community";
import { FollowSocials } from "./follow-socials";
import { ReferralCode } from "./referral-code";
import { ClaimKeys } from "./claim-keys";
import { JoinVMCCDao } from "./join-vmcc-dao";
import { fade } from "@/lib/animation.utils";
import { useGetStepToRedirectTo } from "../hooks/useStepsCompletionStatus";
import { canAccessStep } from "../lib/utils";
import { OnboardingStepSlug } from "../types";
import { useRouter } from "next/navigation";
import { useGetIsClaimedKey } from "../usecases/GetIsClaimedKey.usecase";
import { useGetUplineId } from "../usecases/GetUplineId.usecase";
// import { PhoneVerification } from "./phone-verification";

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      variants={fade}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="w-full grid-child-stack"
    >
      {children}
    </m.div>
  );
}

export function MainScreen() {
  const router = useRouter();
  router.prefetch("/welcome");
  useGetIsClaimedKey();
  useGetUplineId();
  const [{ step: stepSlug }, setOnboardingUrlStates] = useOnboardingUrlStates();
  const accessibleSlug = useGetStepToRedirectTo();

  const isTwitterSigninStep =
    window.location.search.includes("?error") ||
    window.location.search.includes("error_description") ||
    window.location.search.includes("?state") ||
    window.location.search.includes("?code=") ||
    window.location.search.includes("&code=");

  // Fix malformed URLs with double question marks
  useEffect(() => {
    if (isTwitterSigninStep) {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "follow-us",
        x: "signin",
      }));
    }
  }, [isTwitterSigninStep, setOnboardingUrlStates]);

  const isAccessible = (slug: OnboardingStepSlug) => {
    if (!accessibleSlug) return true;
    return canAccessStep({
      slugToAccess: slug,
      accessibleSlug: accessibleSlug,
    });
  };

  useEffect(() => {
    if (!isAccessible(stepSlug)) {
      setOnboardingUrlStates({ step: accessibleSlug });
    }
  }, [stepSlug, accessibleSlug, isAccessible]);

  return (
    <div className="w-full space-y-6 @sm:space-y-8 @container">
      <OnboardingNav />
      <GlassCard className="p-4 @sm:p-6 w-full">
        <div className="grid-parent-stack">
          <AnimatePresence mode="sync">
            {isTwitterSigninStep || stepSlug === "follow-us" ? (
              <>
                <StepWrapper key={"follow-us"}>
                  <FollowSocials />
                </StepWrapper>
              </>
            ) : (
              <>
                {stepSlug === "wallet-connected" && (
                  <StepWrapper key={stepSlug}>
                    <WalletConnected />
                  </StepWrapper>
                )}
                {/* {stepSlug === "verify-phone-number" && (
                <StepWrapper key={stepSlug}>
                  <PhoneVerification />
                </StepWrapper>
              )} */}
                {stepSlug === "join-telegram" && (
                  <StepWrapper key={stepSlug}>
                    <JoinTelegramCommunity />
                  </StepWrapper>
                )}
                {stepSlug === "enter-referral-code" && (
                  <StepWrapper key={stepSlug}>
                    <ReferralCode />
                  </StepWrapper>
                )}
                {stepSlug === "claim-genesis-key" && (
                  <StepWrapper key={stepSlug}>
                    <ClaimKeys />
                  </StepWrapper>
                )}
                {stepSlug === "join-vmcc-dao" && (
                  <StepWrapper key={stepSlug}>
                    <JoinVMCCDao />
                  </StepWrapper>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}
