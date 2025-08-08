"use client";

import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionTitle } from "@/components/ui/section-title";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useModal } from "connectkit";
import { ONBOARDING_STEPS } from "@/modules/onboarding/data";
import { useInitiateLogin } from "@/modules/auth/usecases/InitiateLogin.usecase";
import { Address } from "viem";
import { useGetUplineId } from "@/modules/onboarding/usecases/GetUplineId.usecase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDisconnect } from "wagmi";

export function WelcomeScreen() {
  const { disconnect } = useDisconnect();
  const router = useRouter();
  router.prefetch("/onboarding");
  useGetUplineId();
  const { isConnected, address } = useWalletConnectionStatus();
  const {
    mutate: initiateLogin,
    isSigninMessage,
    isCompletingLogin,
    isInitiating,
  } = useInitiateLogin();

  const { setOpen } = useModal({
    onConnect: ({ address }) => {
      if (address) {
        initiateLogin({
          walletAddress: address as Address,
          appName: "COA Community",
        });
      }
    },
  });

  const handleConnect = () => {
    if (isConnected) {
      if (address) {
        initiateLogin({
          walletAddress: address as Address,
          appName: "COA Community",
        });
      }
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    disconnect();
  }, []);

  const isLoading = isSigninMessage || isCompletingLogin || isInitiating;

  return (
    <div className="w-full @container">
      <GlassCard className="p-4 @sm:p-6 w-full space-y-8">
        <div className="space-y-2 text-center w-full">
          <SectionTitle>Join the VMCC DA0</SectionTitle>
          <p className="text-sm leading-[1.4] text-white/70">
            To claim your free Yard Genesis Key NFT, please complete the
            following steps:
          </p>
        </div>

        <div className="w-full space-y-5">
          {ONBOARDING_STEPS.map((step) => (
            <div
              key={step.slug}
              className="flex items-center justify-start gap-x-3"
            >
              <div className="bg-glass-gradient inline-flex items-center justify-center rounded-[10px] border-[0.5px] border-white/[0.05] border-solid px-3 py-[11px]">
                <Icon
                  name={step.icon}
                  width={20}
                  height={20}
                  className="size-5 text-white"
                />
              </div>
              <p className="text-lg font-normal leading-[1.2] tracking-[0.18px] text-white">
                {step.title}
              </p>
            </div>
          ))}
        </div>

        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full cursor-pointer"
        >
          {isSigninMessage ? (
            "Signing Message"
          ) : isInitiating ? (
            "Initiating Sign in"
          ) : isCompletingLogin ? (
            "Completing Authentication"
          ) : (
            <>{isConnected && address ? "Continue" : "Connect Wallet"}</>
          )}
        </Button>
      </GlassCard>
    </div>
  );
}
