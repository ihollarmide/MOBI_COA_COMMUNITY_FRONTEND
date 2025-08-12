import { IconsNames } from "@/components/icons/icon.types";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useEffect, useState } from "react";
import { isValidUsernameWithAtSign, removeAtSign } from "../lib/utils";
import { INSTAGRAM_LINK, TWITTER_LINK } from "@/common/constants";
import { SectionAction } from "./section-action";
import { SectionMetaInfo } from "./section-meta-info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonsFooter } from "./buttons-footer";
import { useVerifyInstagram } from "../usecases/VerifyInstagram.usecase";
import { useVerifyTwitter } from "../usecases/VerifyTwitter.usecase";
import { useGetAuthStatus } from "@/modules/auth/usecases/GetAuthStatus.usecase";
import { Icon } from "@/components/icons/icon";

type Platform = "x" | "instagram";
type PageState = "follow" | "verify" | "success";

interface PlatformConfig {
  name: string;
  displayName: string;
  icon: IconsNames;
  link: string;
  placeholder: string;
}

const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  x: {
    name: "x",
    displayName: "X",
    icon: IconsNames.X_SOCIAL,
    link: TWITTER_LINK,
    placeholder: "Your X @username",
  },
  instagram: {
    name: "instagram",
    displayName: "Instagram",
    icon: IconsNames.INSTAGRAM,
    link: INSTAGRAM_LINK,
    placeholder: "Your Instagram @username",
  },
};

const getTitleMap = (platform: Platform) => {
  const config = PLATFORM_CONFIG[platform];
  return {
    follow: {
      title: `Follow us on ${config.displayName}`,
      description: `Click "Follow" to join our ${config.displayName} community`,
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
} {
  const { data: authStatus } = useGetAuthStatus();

  const [username, setUsername] = useState<string>("");
  const [page, setPage] = useState<PageState>("follow");
  const [error, setError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });

  const isVerified =
    platform === "x"
      ? authStatus?.data?.twitterFollowed
      : authStatus?.data?.instagramFollowed;

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
  };
}

interface PlatformTabProps {
  platform: Platform;
  onBack: () => void;
  onConfirm: (platform: Platform) => void;
}

function PlatformTab({ platform, onBack, onConfirm }: PlatformTabProps) {
  const config = PLATFORM_CONFIG[platform];

  const { data: authStatus } = useGetAuthStatus();

  const { mutate: verifyInstagram } = useVerifyInstagram();
  const { mutate: verifyX } = useVerifyTwitter();

  const { username, page, error, setUsername, setPage, setError } =
    usePlatformState(platform);

  const handleConfirm = () => {
    if (page === "follow") {
      setPage("verify");
    } else if (page === "verify") {
      const { isError, error: validationError } = isValidUsernameWithAtSign(
        username,
        platform
      );
      if (isError) {
        setError({ isError, error: validationError });
        return;
      }
      if (platform === "instagram") {
        verifyInstagram(
          {
            username: removeAtSign(username),
          },
          {
            onSuccess: () => {
              setPage("success");
            },
            onError: (error) => {
              setError({ isError: true, error: error.message });
            },
          }
        );
      } else if (platform === "x") {
        verifyX(
          {
            username: removeAtSign(username),
          },
          {
            onSuccess: () => {
              setPage("success");
            },
            onError: (error) => {
              setError({ isError: true, error: error.message });
            },
          }
        );
      }
      return;
    } else if (page === "success") {
      onConfirm(platform);
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

  useEffect(() => {
    // Only set to success if this specific platform is verified
    const isPlatformVerified =
      platform === "x"
        ? !!authStatus?.data?.twitterFollowed
        : !!authStatus?.data?.instagramFollowed;

    if (isPlatformVerified && page !== "success") {
      setPage("success");
    }
  }, [
    authStatus?.data?.twitterFollowed,
    authStatus?.data?.instagramFollowed,
    page,
    platform,
  ]);

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
      <ButtonsFooter>
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
      </ButtonsFooter>
    </TabsContent>
  );
}

export function FollowSocials() {
  const [{ tab }, setOnboardingUrlStates] = useOnboardingUrlStates();
  const { data: authStatus } = useGetAuthStatus();
  const xState = usePlatformState("x");
  const instagramState = usePlatformState("instagram");

  const handleBack = () => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      step: "join-telegram",
    }));
  };

  const handleConfirm = (platform: Platform) => {
    if (
      platform === "x" &&
      (xState.page === "success" || instagramState.page === "success")
    ) {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "enter-referral-code",
      }));
    } else if (
      platform === "instagram" &&
      (instagramState.page === "success" || xState.page === "success")
    ) {
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
              {authStatus?.data?.twitterFollowed ? (
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
              {authStatus?.data?.instagramFollowed ? (
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

        <PlatformTab
          platform="x"
          onBack={handleBack}
          onConfirm={handleConfirm}
        />

        <PlatformTab
          platform="instagram"
          onBack={handleBack}
          onConfirm={handleConfirm}
        />
      </section>
    </Tabs>
  );
}
