"use client";

import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionTitle } from "@/components/ui/section-title";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useModal } from "connectkit";
import { ONBOARDING_STEPS } from "@/modules/onboarding/data";
import { useRouter } from "next/navigation";

export function WelcomeScreen() {
  const router = useRouter();
  const { isConnected, address } = useWalletConnectionStatus();

  const { setOpen } = useModal({
    onConnect: ({ address }) => {
      if (address) {
        router.replace(`/onboarding`);
      }
    },
  });

  const handleConnect = () => {
    if (isConnected) {
      if (address) {
        router.replace(`/onboarding`);
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <GlassCard className="p-6 w-full space-y-8">
      <div className="space-y-2 text-center w-full">
        <SectionTitle>Join the VMCC DA0</SectionTitle>
        <p className="text-sm leading-[1.4] text-white/70">
          To claim your free Yard Genesis Key NFT, please complete the following
          steps:
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

      <Button onClick={handleConnect} className="w-full cursor-pointer">
        {isConnected && address ? "Continue" : "Connect Wallet"}
      </Button>
    </GlassCard>
  );
}
