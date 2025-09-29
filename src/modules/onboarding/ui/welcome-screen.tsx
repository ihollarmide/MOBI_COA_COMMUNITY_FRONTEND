"use client";

import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionTitle } from "@/components/ui/section-title";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { ONBOARDING_STEPS } from "@/modules/onboarding/data";
import { useInitiateUserAuthentication } from "@/modules/auth/usecases/InitiateUserAuthentication.usecase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { getRecaptchaV3Token } from "@/lib/captcha";
import { connectWalletAction } from "@/app/actions";
import { useAppKit } from "@reown/appkit/react";
import { useDisconnect } from "@reown/appkit/react";

import {
  // FingerprintJSPro,
  FpjsProvider,
} from "@fingerprintjs/fingerprintjs-pro-react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { AUTH_TOAST_ID, SIGNIN_APP_NAME } from "@/modules/auth/constants";
import { useWalletOnConnect } from "@/hooks/useWalletOnConnect";

export function WelcomeScreen({ fingerPrintKey }: { fingerPrintKey: string }) {
  const params = useSearchParams();

  const error = params.get("error");
  const code = params.get("code");

  // ?error=CredentialsSignin&code=credentials

  useEffect(() => {
    if (!!error || !!code) {
      toast.error("There was an error signing in. Please try again.", {
        description: "",
        id: AUTH_TOAST_ID,
      });
    }
  }, [error, code]);

  return (
    <FpjsProvider
      loadOptions={{
        apiKey: fingerPrintKey,
        region: "us",
        // endpoint: [
        //   "https://metrics.coa.build/73m1VCzNAzVUBpAV/aqRK0DiVNN1rcQcs",
        //   FingerprintJSPro.defaultEndpoint,
        // ],
        // scriptUrlPattern: [
        //   "https://metrics.coa.build/73m1VCzNAzVUBpAV/8kBRPgy1iMYUkkOh?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>",
        //   FingerprintJSPro.defaultScriptUrlPattern,
        // ],
      }}
    >
      <WelcomeScreenContent />
    </FpjsProvider>
  );
}

function WelcomeScreenContent() {
  const router = useRouter();
  router.prefetch("/onboarding");
  const {
    isLoading: isGettingFingerprint,
    error: fingerPrintError,
    data: fingerPrintData,
    getData,
  } = useVisitorData({ extendedResult: true }, { immediate: true });
  const [showV2Challenge, setShowV2Challenge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { disconnect } = useDisconnect();

  const { isConnected, address, status } = useWalletConnectionStatus();
  const {
    mutate: initiateUserAuthentication,
    isSigninMessage,
    isCompletingUserAuthentication,
    isInitiatingUserAuthentication,
    isPending: isAuthenticationInProgress,
  } = useInitiateUserAuthentication({
    fingerPrintId: fingerPrintData?.visitorId ?? "",
    ipAddress: fingerPrintData?.ip ?? "",
  });

  const { open } = useAppKit();

  const handleDisconnect = async () => {
    await disconnect();
    open({
      view: "Connect",
      namespace: "eip155",
    });
  };

  useWalletOnConnect({
    onConnect: ({ address }) => {
      initiateUserAuthentication({
        walletAddress: address,
        appName: SIGNIN_APP_NAME,
      });
    },
  });

  const handleConnect = async () => {
    if (status !== "disconnected") {
      await handleDisconnect();
    } else {
      open({
        view: "Connect",
        namespace: "eip155",
      });
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (isGettingFingerprint) return;
    if (fingerPrintError) {
      getData({
        ignoreCache: true,
      });
    }

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

  const isBtnDisabled =
    isAuthenticationInProgress ||
    isSubmitting ||
    showV2Challenge ||
    isGettingFingerprint;

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
            type={"submit"}
            disabled={isBtnDisabled}
            className="w-full cursor-pointer"
          >
            {isGettingFingerprint ? (
              "Analyzing User..."
            ) : fingerPrintError ? (
              fingerPrintError.message
            ) : isSubmitting ? (
              "Verifying..."
            ) : isSigninMessage ? (
              "Signing Message"
            ) : isInitiatingUserAuthentication ? (
              "Initiating Sign in"
            ) : isCompletingUserAuthentication ? (
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
