"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { OnboardingNav } from "./onboarding-nav";
import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useOnboardingUrlStates } from "../hooks/useOnboardingUrlStates";
import { WalletConnected } from "./wallet-connected";
import { JoinTelegramCommunity } from "./join-telegram-community";
import { FollowSocials } from "./follow-socials";
import { ReferralCode } from "./referral-code";
import { ClaimKeys } from "./claim-keys";
import { JoinVMCCDao } from "./join-vmcc-dao";
import { fade } from "@/lib/animation.utils";
import { signOut, useSession } from "next-auth/react";
import { useGetStepToRedirectTo } from "../hooks/useStepsCompletionStatus";
import { canAccessStep } from "../lib/utils";
import { OnboardingStepSlug } from "../types";
import { useRouter } from "next/navigation";
import { useGetIsClaimedKey } from "../usecases/GetIsClaimedKey.usecase";
import { useGetUplineId } from "../usecases/GetUplineId.usecase";

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
  useGetIsClaimedKey();
  useGetUplineId();
  const router = useRouter();
  router.prefetch("/welcome");

  const { data: session, status: sessionStatus } = useSession();
  const { status: walletStatus, address } = useWalletConnectionStatus();
  const [{ step: stepSlug }, setOnboardingUrlStates] = useOnboardingUrlStates();
  const accessibleSlug = useGetStepToRedirectTo();

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

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/welcome");
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (walletStatus === "disconnected") {
      signOut({
        redirect: true,
        redirectTo: "/welcome",
      });
    }
  }, [walletStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && address) {
      if (session.user.walletAddress.toLowerCase() !== address.toLowerCase()) {
        signOut({
          redirect: true,
          redirectTo: "/welcome",
        });
      }
    }
  }, [sessionStatus, address, session?.user?.walletAddress]);

  return (
    <div className="w-full space-y-6 @sm:space-y-8 @container">
      <OnboardingNav />
      <GlassCard className="p-4 @sm:p-6 w-full">
        <div className="grid-parent-stack">
          <AnimatePresence mode="sync">
            {stepSlug === "wallet-connected" && (
              <StepWrapper key={stepSlug}>
                <WalletConnected />
              </StepWrapper>
            )}
            {stepSlug === "join-telegram" && (
              <StepWrapper key={stepSlug}>
                <JoinTelegramCommunity />
              </StepWrapper>
            )}
            {stepSlug === "follow-us" && (
              <StepWrapper key={stepSlug}>
                <FollowSocials />
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
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}
