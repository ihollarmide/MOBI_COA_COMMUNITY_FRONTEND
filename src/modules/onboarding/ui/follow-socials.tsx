import { IconsNames } from "@/components/icons/icon.types";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useEffect, useState } from "react";
import {
  getInstagramUserVerifiedKey,
  getXUserVerifiedKey,
  isValidUsernameWithAtSign,
} from "../lib/utils";
import { useChainId } from "wagmi";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useSessionStorage } from "@/shared/hooks";
import { INSTAGRAM_LINK, TWITTER_LINK } from "@/constants";
import { SectionAction } from "./section-action";
import { SectionMetaInfo } from "./section-meta-info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getTitleMap = (tab: "x" | "instagram") => ({
  follow: {
    title: `Follow us on ${tab === "x" ? "X" : "Instagram"}`,
    description: `This button redirects you to the ${tab === "x" ? "X" : "Instagram"} app on your device`,
  },
  verify: {
    title: `Confirm ${tab === "x" ? "X" : "Instagram"} Follow`,
    description: `Enter your ${tab === "x" ? "X" : "Instagram"} username to verify`,
  },
  success: {
    title: `Your ${tab === "x" ? "X" : "Instagram"} account has been verified!`,
    description: `Move on to the next step to claim your airdrop.`,
  },
});

const getJoinActionList = (tab: "x" | "instagram") => [
  `Click the “Follow” button to access the ${tab === "x" ? "X" : "Instagram"}. This button redirects you to the ${tab === "x" ? "X" : "Instagram"} app on your device and enables you to join the community.`,
  `After joining, come back to this window and enter your ${tab === "x" ? "X" : "Instagram"} username in the input box.`,
  `Click “Verify” to confirm you've followed the page.`,
  `Click “Next” to proceed to the next action.`,
];

export function FollowSocials() {
  const chainId = useChainId();
  const { address } = useWalletConnectionStatus();
  const [xUsername, setXUsername] = useState<string>("");
  const [instagramUsername, setInstagramUsername] = useState<string>("");
  const { set: setXUserVerified, value: xUserVerified } = useSessionStorage(
    getXUserVerifiedKey({
      chainId,
      address: address ?? "",
    })
  );

  const { set: setInstagramUserVerified, value: instagramUserVerified } =
    useSessionStorage(
      getInstagramUserVerifiedKey({
        chainId,
        address: address ?? "",
      })
    );

  const [xPage, setXPage] = useState<"follow" | "verify" | "success">(
    xUserVerified === true ? "success" : "follow"
  );
  const [instagramPage, setInstagramPage] = useState<
    "follow" | "verify" | "success"
  >(instagramUserVerified === true ? "success" : "follow");
  const [xUsernameError, setXUsernameError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });

  const [instagramUsernameError, setInstagramUsernameError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });
  const [{ tab }, setOnboardingUrlStates] = useOnboardingUrlStates();

  const handleBack = () => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      step: "join-telegram",
    }));
  };

  const handleConfirm = (tab: "x" | "instagram") => {
    if (tab === "x") {
      if (xPage === "follow") {
        setXPage("verify");
      } else if (xPage === "verify") {
        const { isError, error } = isValidUsernameWithAtSign(xUsername);
        if (isError) {
          setXUsernameError({ isError, error });
          return;
        }
        // TODO: call api to verify username
        setXPage("success");
        setXUserVerified(true);
        return;
      } else if (xPage === "success") {
        if (instagramUserVerified === true) {
          setOnboardingUrlStates((prev) => ({
            ...prev,
            step: "enter-referral-code",
          }));
        } else {
          setOnboardingUrlStates((prev) => ({
            ...prev,
            tab: "instagram",
          }));
        }
        return;
      }
    }

    if (instagramPage === "follow") {
      setInstagramPage("verify");
    } else if (instagramPage === "verify") {
      const { isError, error } = isValidUsernameWithAtSign(instagramUsername);
      if (isError) {
        setInstagramUsernameError({ isError, error });
        return;
      }
      // TODO: call api to verify username
      setInstagramPage("success");
      setInstagramUserVerified(true);
      return;
    } else if (instagramPage === "success") {
      if (xUserVerified === true) {
        setOnboardingUrlStates((prev) => ({
          ...prev,
          step: "enter-referral-code",
        }));
      } else {
        setOnboardingUrlStates((prev) => ({
          ...prev,
          tab: "x",
        }));
      }
    }
  };

  const handleTabChange = (value: string) => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      tab: value as "x" | "instagram",
    }));
  };

  useEffect(() => {
    if (xUserVerified === true && xPage !== "success") {
      setXPage("success");
    }
    if (instagramUserVerified === true && instagramPage !== "success") {
      setInstagramPage("success");
    }
  }, [xUserVerified, xPage, instagramUserVerified, instagramPage]);

  return (
    <Tabs
      defaultValue={"x"}
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
            <TabsTrigger value="x">X</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="w-full mt-2 space-y-6" value="x">
          <SectionMetaInfo items={getJoinActionList("x")} />
          <SectionAction
            title={getTitleMap(tab)[xPage].title}
            description={getTitleMap(tab)[xPage].description}
            icon={IconsNames.X_SOCIAL}
            isSuccess={xPage === "success"}
            isCollapsibleOpen={xPage === "verify"}
            isError={xUsernameError.isError}
            errorMessage={xUsernameError.error}
            inputPlaceholder={`Your X @username`}
            onInputChange={setXUsername}
            inputValue={xUsername}
          />
          <div className="w-full grid @sm:grid-cols-2 gap-y-4 gap-x-2 @md:gap-x-3.5">
            <Button
              variant="secondary"
              onClick={handleBack}
              className="cursor-pointer"
            >
              Back
            </Button>
            <Button
              asChild={xPage === "follow"}
              onClick={() => handleConfirm("x")}
              className="cursor-pointer"
            >
              {xPage === "follow" ? (
                <a
                  href={TWITTER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow
                </a>
              ) : xPage === "verify" ? (
                "Verify"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </TabsContent>
        <TabsContent className="w-full mt-2 space-y-6" value="instagram">
          <SectionMetaInfo items={getJoinActionList("instagram")} />
          <SectionAction
            title={getTitleMap(tab)[instagramPage].title}
            description={getTitleMap(tab)[instagramPage].description}
            icon={IconsNames.INSTAGRAM}
            isSuccess={instagramPage === "success"}
            isCollapsibleOpen={instagramPage === "verify"}
            isError={instagramUsernameError.isError}
            errorMessage={instagramUsernameError.error}
            inputPlaceholder={`Your Instagram @username`}
            onInputChange={setInstagramUsername}
            inputValue={instagramUsername}
          />
          <div className="w-full grid @sm:grid-cols-2 gap-y-4 gap-x-2 @md:gap-x-3.5">
            <Button
              variant="secondary"
              onClick={handleBack}
              className="cursor-pointer"
            >
              Back
            </Button>
            <Button
              asChild={instagramPage === "follow"}
              onClick={() => handleConfirm("instagram")}
              className="cursor-pointer"
            >
              {instagramPage === "follow" ? (
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow
                </a>
              ) : instagramPage === "verify" ? (
                "Verify"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </TabsContent>
      </section>
    </Tabs>
  );
}
