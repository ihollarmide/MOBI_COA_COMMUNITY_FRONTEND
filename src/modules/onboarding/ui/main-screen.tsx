"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { OnboardingNav } from "./onboarding-nav";
import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useRouter } from "next/navigation";
import { useOnboardingUrlStates } from "../hooks/useOnboardingUrlStates";
import { WalletConnected } from "./wallet-connected";
import { JoinTelegramCommunity } from "./join-telegram-community";
import { FollowSocials } from "./follow-socials";
import { ReferralCode } from "./referral-code";
import { ClaimKeys } from "./claim-keys";
import { JoinOurCommunities } from "./join-our-communities";
import { fade } from "@/lib/animation.utils";

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      variants={fade}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.3 }}
      className="w-full grid-child-stack"
    >
      {children}
    </m.div>
  );
}

export function MainScreen() {
  const router = useRouter();
  const { status } = useWalletConnectionStatus();
  const [{ step: stepSlug }] = useOnboardingUrlStates();

  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/");
    }
  }, [status]);

  return (
    <div className="w-full space-y-8">
      <OnboardingNav />
      <GlassCard className="p-6 w-full">
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
                <JoinOurCommunities />
              </StepWrapper>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}
