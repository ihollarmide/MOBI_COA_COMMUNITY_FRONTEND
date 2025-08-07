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
import { INSTAGRAM_LINK, TWITTER_LINK } from "@/common/constants";
import { SectionAction } from "./section-action";
import { SectionMetaInfo } from "./section-meta-info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Platform = "x" | "instagram";
type PageState = "follow" | "verify" | "success";

interface PlatformConfig {
  name: string;
  displayName: string;
  icon: IconsNames;
  link: string;
  placeholder: string;
  getVerifiedKey: (params: { chainId: number; address: string }) => string;
}

const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  x: {
    name: "x",
    displayName: "X",
    icon: IconsNames.X_SOCIAL,
    link: TWITTER_LINK,
    placeholder: "Your X @username",
    getVerifiedKey: getXUserVerifiedKey,
  },
  instagram: {
    name: "instagram",
    displayName: "Instagram",
    icon: IconsNames.INSTAGRAM,
    link: INSTAGRAM_LINK,
    placeholder: "Your Instagram @username",
    getVerifiedKey: getInstagramUserVerifiedKey,
  },
};

const getTitleMap = (platform: Platform) => {
  const config = PLATFORM_CONFIG[platform];
  return {
    follow: {
      title: `Follow us on ${config.displayName}`,
      description: `This button redirects you to the ${config.displayName} app on your device`,
    },
    verify: {
      title: `Confirm ${config.displayName} Follow`,
      description: `Enter your ${config.displayName} username to verify`,
    },
    success: {
      title: `Your ${config.displayName} account has been verified!`,
      description: `Move on to the next step to claim your airdrop.`,
    },
  };
};

const getJoinActionList = (platform: Platform) => {
  const config = PLATFORM_CONFIG[platform];
  return [
    `Click the "Follow" button to access the ${config.displayName}. This button redirects you to the ${config.displayName} app on your device and enables you to join the community.`,
    `After joining, come back to this window and enter your ${config.displayName} username in the input box.`,
    `Click "Verify" to confirm you've followed the page.`,
    `Click "Next" to proceed to the next action.`,
  ];
};

interface PlatformState {
  username: string;
  page: PageState;
  error: { isError: boolean; error: string | null };
  isVerified: boolean;
}

function usePlatformState(platform: Platform): PlatformState & {
  setUsername: (username: string) => void;
  setPage: (page: PageState) => void;
  setError: (error: { isError: boolean; error: string | null }) => void;
  setVerified: (verified: boolean) => void;
} {
  const chainId = useChainId();
  const { address } = useWalletConnectionStatus();
  const config = PLATFORM_CONFIG[platform];

  const [username, setUsername] = useState<string>("");
  const [page, setPage] = useState<PageState>("follow");
  const [error, setError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });

  const { set: setVerified, value: isVerified } = useSessionStorage(
    config.getVerifiedKey({
      chainId,
      address: address ?? "",
    })
  );

  useEffect(() => {
    if (isVerified === true && page !== "success") {
      setPage("success");
    }
  }, [isVerified, page]);

  return {
    username,
    page,
    error,
    isVerified: isVerified === true,
    setUsername,
    setPage,
    setError,
    setVerified,
  };
}

interface PlatformTabProps {
  platform: Platform;
  onBack: () => void;
  onConfirm: (platform: Platform) => void;
  otherPlatformVerified: boolean;
}

function PlatformTab({
  platform,
  onBack,
  onConfirm,
  otherPlatformVerified,
}: PlatformTabProps) {
  const config = PLATFORM_CONFIG[platform];
  const { username, page, error, setUsername, setPage, setError, setVerified } =
    usePlatformState(platform);

  const handleConfirm = () => {
    if (page === "follow") {
      setPage("verify");
    } else if (page === "verify") {
      const { isError, error: validationError } =
        isValidUsernameWithAtSign(username);
      if (isError) {
        setError({ isError, error: validationError });
        return;
      }
      // TODO: call api to verify username
      setPage("success");
      setVerified(true);
      return;
    } else if (page === "success") {
      if (otherPlatformVerified) {
        onConfirm(platform);
      } else {
        // Switch to other platform
        onConfirm(platform);
      }
      return;
    }
  };

  const getButtonText = () => {
    switch (page) {
      case "follow":
        return "Follow";
      case "verify":
        return "Verify";
      case "success":
        return "Next";
    }
  };

  const getButtonContent = () => {
    if (page === "follow") {
      return (
        <a href={config.link} target="_blank" rel="noopener noreferrer">
          Follow
        </a>
      );
    }
    return getButtonText();
  };

  return (
    <TabsContent className="w-full mt-2 space-y-6" value={platform}>
      <SectionMetaInfo items={getJoinActionList(platform)} />
      <SectionAction
        title={getTitleMap(platform)[page].title}
        description={getTitleMap(platform)[page].description}
        icon={config.icon}
        isSuccess={page === "success"}
        isCollapsibleOpen={page === "verify"}
        isError={error.isError}
        errorMessage={error.error}
        inputPlaceholder={config.placeholder}
        onInputChange={setUsername}
        inputValue={username}
      />
      <div className="w-full grid @sm:grid-cols-2 gap-y-4 gap-x-2 @md:gap-x-3.5">
        <Button variant="secondary" onClick={onBack} className="cursor-pointer">
          Back
        </Button>
        <Button
          asChild={page === "follow"}
          onClick={handleConfirm}
          className="cursor-pointer"
        >
          {getButtonContent()}
        </Button>
      </div>
    </TabsContent>
  );
}

export function FollowSocials() {
  const [{ tab }, setOnboardingUrlStates] = useOnboardingUrlStates();
  const xState = usePlatformState("x");
  const instagramState = usePlatformState("instagram");

  const handleBack = () => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      step: "join-telegram",
    }));
  };

  const handleConfirm = (platform: Platform) => {
    if (platform === "x" && xState.page === "success") {
      if (instagramState.isVerified) {
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
    } else if (platform === "instagram" && instagramState.page === "success") {
      if (xState.isVerified) {
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
      tab: value as Platform,
    }));
  };

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
            <TabsTrigger value="x">X</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>
        </div>

        <PlatformTab
          platform="x"
          onBack={handleBack}
          onConfirm={handleConfirm}
          otherPlatformVerified={instagramState.isVerified}
        />

        <PlatformTab
          platform="instagram"
          onBack={handleBack}
          onConfirm={handleConfirm}
          otherPlatformVerified={xState.isVerified}
        />
      </section>
    </Tabs>
  );
}
