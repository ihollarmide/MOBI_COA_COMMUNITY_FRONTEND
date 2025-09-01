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
import { useGetIsClaimedKey } from "../usecases/GetIsClaimedKey.usecase";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { serializeOnboardingUrlStates } from "../hooks/useOnboardingUrlStates";
import { useDisconnect } from "wagmi";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { getRecaptchaV3Token } from "@/lib/captcha";
import { connectWalletAction } from "@/app/actions";

const TOAST_ID = "onboarding-toast";

export function WelcomeScreen() {
  const [showV2Challenge, setShowV2Challenge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status: sessionStatus, data: session } = useSession();
  const { data: isClaimed } = useGetIsClaimedKey();
  const { data: uplineId } = useGetUplineId();
  const router = useRouter();
  router.prefetch("/onboarding");
  const { isConnected, address, status } = useWalletConnectionStatus();
  const {
    mutate: initiateLogin,
    isSigninMessage,
    isCompletingLogin,
    isInitiating,
  } = useInitiateLogin();

  const { disconnectAsync } = useDisconnect({
    mutation: {
      onSuccess: () => {
        setOpen(true);
      },
      onError: (error) => {
        toast.error("Unable to open wallet connector. Please reload", {
          description:
            typeof error === "string"
              ? error
              : error?.message || "Unknown error",
          id: TOAST_ID,
        });
      },
    },
  });

  const { setOpen } = useModal({
    onConnect: async ({ address }) => {
      if (address) {
        initiateLogin({
          walletAddress: address as Address,
          appName: "COA Community",
        });
      } else {
        await disconnectAsync();
        toast.error("Unable to get wallet address. Please reload", {
          description: "No address found",
          id: TOAST_ID,
        });
      }
    },
  });

  const handleConnect = async () => {
    if (status !== "disconnected") {
      await disconnectAsync();
    } else {
      setOpen(true);
    }
  };

  const isLoading = isSigninMessage || isCompletingLogin || isInitiating;

  useEffect(() => {
    const onboardingRoute = "/onboarding";
    if (sessionStatus === "authenticated" && address) {
      if (isClaimed || session?.user?.genesisClaimed) {
        return router.replace(
          onboardingRoute +
            serializeOnboardingUrlStates({
              step: "join-vmcc-dao",
            })
        );
      } else if (session?.user?.uplineId || !!uplineId) {
        if (!session?.user?.telegramJoined) {
          return router.replace(
            onboardingRoute +
              serializeOnboardingUrlStates({
                step: "join-telegram",
              })
          );
        }

        if (
          !session?.user?.twitterFollowed &&
          !session?.user?.instagramFollowed
        ) {
          return router.replace(
            onboardingRoute +
              serializeOnboardingUrlStates({
                step: "follow-us",
              })
          );
        }

        return router.replace(
          onboardingRoute +
            serializeOnboardingUrlStates({
              step: "claim-genesis-key",
            })
        );
      } else if (
        session?.user?.twitterFollowed ||
        session?.user?.instagramFollowed
      ) {
        if (!session?.user?.telegramJoined) {
          return router.replace(
            onboardingRoute +
              serializeOnboardingUrlStates({
                step: "join-telegram",
              })
          );
        }

        return router.replace(
          onboardingRoute +
            serializeOnboardingUrlStates({
              step: "enter-referral-code",
            })
        );
      } else if (session?.user?.telegramJoined) {
        return router.replace(
          onboardingRoute +
            serializeOnboardingUrlStates({
              step: "follow-us",
            })
        );
      }
      router.replace(onboardingRoute);
    }
  }, [
    sessionStatus,
    address,
    session?.user?.uplineId,
    session?.user?.twitterFollowed,
    session?.user?.instagramFollowed,
    session?.user?.telegramJoined,
    session?.user?.genesisClaimed,
    isClaimed,
    uplineId,
  ]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setShowV2Challenge(false);
    toast.loading("Verifying user...", {
      id: "captcha",
    });
    const v3Token = await getRecaptchaV3Token();
    const res = await connectWalletAction({ v3Token });

    if (res.success) {
      toast.success("User verified", {
        id: "captcha",
      });
      handleConnect();
    } else if (res.requireV2) {
      toast.error("Additional challenge required", {
        id: "captcha",
      });
      setShowV2Challenge(true);
    } else {
      toast.error(res.message ?? "Verification failed. Please try again", {
        id: "captcha",
      });
    }
    setIsSubmitting(false);
  }

  // This handler is for the v2 FALLBACK submission
  async function handleV2Submit(v2Token: string | null) {
    if (!v2Token) {
      toast.error("Challenge expired. Please try again.", { id: "captcha" });
      setShowV2Challenge(false); // Hide and let them retry the form
      return;
    }

    setIsSubmitting(true);
    toast.loading("Finalizing verification...", { id: "captcha" });

    const res = await connectWalletAction({ v2Token }); // Send the v2 token this time

    if (res.success) {
      toast.success("User verified!", { id: "captcha" });
      setShowV2Challenge(false);
      handleConnect();
    } else {
      toast.error(res.message || "Final verification failed.", {
        id: "captcha",
      });
      setShowV2Challenge(false); // Hide and let them retry the form
    }
    setIsSubmitting(false);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="w-full @container">
        <GlassCard className="p-4 @sm:p-6 w-full space-y-8">
          <div className="space-y-2 text-center w-full">
            <SectionTitle>Join the VMCC DAO</SectionTitle>
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

          {showV2Challenge && (
            <div className="flex justify-center w-full my-4">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_V2_SITE_KEY!}
                onChange={handleV2Submit}
                theme="light" // Optional: "light" or "dark"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || isSubmitting || showV2Challenge}
            className="w-full cursor-pointer"
          >
            {isSubmitting ? (
              "Verifying..."
            ) : isSigninMessage ? (
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
    </form>
  );
}
