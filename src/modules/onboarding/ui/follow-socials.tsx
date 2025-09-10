import { IconsNames } from "@/components/icons/icon.types";
import { SectionTitle } from "@/components/ui/section-title";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useGetAuthStatus } from "@/modules/auth/usecases/GetAuthStatus.usecase";
import { Icon } from "@/components/icons/icon";
import { toast } from "sonner";
import { XPlatform } from "./x-platform";
import { IGPlatform } from "./ig-platform";

type Platform = "x" | "instagram";

export function FollowSocials() {
  const [{ tab }, setOnboardingUrlStates] = useOnboardingUrlStates();
  const [isXVerfied, setIsXVerfied] = useState(false);
  const [isInstagramVerified, setIsInstagramVerified] = useState(false);
  const { data: authStatus } = useGetAuthStatus();

  const handlePrevStep = () => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      step: "join-telegram",
    }));
  };

  const handleNextStep = () => {
    if (tab === "instagram") {
      if (!isInstagramVerified) {
        toast.error("Verify your Instagram account", {
          description: "You need to verify your Instagram account to continue",
          id: "verify-instagram",
        });
        return;
      }
      if (!isXVerfied) {
        toast.error("Verify your X account", {
          description: "You need to verify your X account to continue",
          id: "verify-x",
        });
        setOnboardingUrlStates((prev) => ({
          ...prev,
          tab: "x",
        }));
        return;
      }
    }
    if (isXVerfied) {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "enter-referral-code",
      }));
    }
  };

  const handleTabChange = (value: string) => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      tab: value as Platform,
    }));
  };

  const isXPlatformVerified =
    !!authStatus?.data?.twitterFollowed &&
    !!authStatus?.data?.twitterUsername &&
    !!authStatus?.data.twitterId &&
    !!authStatus?.data.tweetLink;

  const isInstagramPlatformVerified =
    !!authStatus?.data?.instagramFollowed &&
    !!authStatus?.data?.instagramUsername;

  useEffect(() => {
    if (isXPlatformVerified && !isXVerfied) {
      setIsXVerfied(true);
      setOnboardingUrlStates((prev) => ({
        ...prev,
        x: "success",
      }));
    }
  }, [isXPlatformVerified, isXVerfied]);

  useEffect(() => {
    if (isInstagramPlatformVerified && !isInstagramVerified) {
      setIsInstagramVerified(true);
      setOnboardingUrlStates((prev) => ({
        ...prev,
        instagram: "success",
      }));
    }
  }, [isInstagramPlatformVerified, isInstagramVerified]);

  return (
    <Tabs
      defaultValue="x"
      value={tab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <section className="w-full @container">
        <div className="space-y-2">
          <SectionTitle className="text-center">
            {tab === "x" ? "Follow Us on X" : "Follow Us on Instagram"}
          </SectionTitle>
          <TabsList className="w-full flex items-center gap-2">
            <TabsTrigger value="x">
              X
              {isXPlatformVerified ? (
                <>
                  <Icon
                    name={IconsNames.SUCCESS}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="instagram">
              Instagram
              {isInstagramPlatformVerified ? (
                <>
                  <Icon
                    name={IconsNames.SUCCESS}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </div>

        <XPlatform
          setIsVerfied={setIsXVerfied}
          isVerified={isXVerfied}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
        />

        <IGPlatform
          setIsVerfied={setIsInstagramVerified}
          isVerified={isInstagramVerified}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
        />
      </section>
    </Tabs>
  );
}
