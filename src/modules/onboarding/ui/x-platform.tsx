import { TabsContent } from "@/components/ui/tabs";
import { SectionMetaInfo } from "./section-meta-info";
import { SectionAction } from "./section-action";
import { useEffect, useState } from "react";
import { IconsNames } from "@/components/icons/icon.types";
import { ButtonsFooter } from "./buttons-footer";
import { Button } from "@/components/ui/button";
import { X_POST_LINK, X_VMCC_DAO_PAGE_LINK } from "@/common/constants";
import { useVerifyTweet } from "@/modules/onboarding/usecases/VerifyTweet.usecase";
import { useCompleteTwitterOAuth } from "@/modules/onboarding/hooks/useCompleteTwitterOAuth";
import { isValidPostLink } from "@/modules/onboarding/lib/utils";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { XSteps } from "@/modules/onboarding/types";
import { useGetAuthStatus } from "@/modules/auth/usecases/GetAuthStatus.usecase";

export const TWITTER_POST =
  "'The VMCC Builder DAO is a global community of Virtual Mining & Construction Companies tokenizing residential, commercial & industrial assets. Get a free Genesis Key ($350 value) with Referral Code: MCL-000003 #VMCC #VMCCAirdrop #BuildersDAO #MOBIAutomation'";

export const X_TITLE_MAP = {
  signin: {
    title: "Sign in to X",
    description: "Sign in to your X account.",
  },
  follow: {
    title: "Follow us on X",
    description: `Click "Follow" to join our X community`,
  },
  post: {
    title: "Post this tweet and copy the link",
    description: `Post this tweet: ${TWITTER_POST}`,
  },
  verify: {
    title: `Confirm X Username and Paste Tweet Link`,
    description: "Verify your X username and tweet link by clicking 'Verify'.",
  },
  success: {
    title: `Your X account has been verified!`,
    description: `Move on to the next step to claim your airdrop.`,
  },
};

export const Action_LIST = [
  `Click the "Sign in" button to authenticate your X account`,
  `Click the "Follow" button to access X. This button redirects you to the X app on your device and enables you to join the VMCC community.`,
  "After following, post the provided  tweet, copy and paste its link in the designated input box.",
  `Click "Verify" to confirm you have done the above.`,
  `Click "Next" to proceed to the next action.`,
];

export function XPlatform({
  setIsVerfied,
  isVerified,
  onPrevStep,
  onNextStep,
}: {
  setIsVerfied: (isVerfied: boolean) => void;
  isVerified: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
}) {
  const { data: userStatus } = useGetAuthStatus();
  const [{ x: xStep }, setOnboardingUrlStates] = useOnboardingUrlStates();
  const [tweetLink, setTweetLink] = useState<string>("");
  const [tweetLinkError, setTweetLinkError] = useState<{
    isError: boolean;
    error: string | null;
  }>({ isError: false, error: null });

  const { mutate: verifyTweet, isPending: isVerifyingTweet } = useVerifyTweet();

  const setXStep = (step: XSteps) => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      x: step,
    }));
  };

  const { isCompletingTwitterOAuth } = useCompleteTwitterOAuth({
    onSuccess: () => {
      setXStep("follow");
    },
  });

  const onBack = () => {
    if (xStep === "signin" || xStep === "success" || isVerified) {
      onPrevStep();
    } else if (xStep === "post") {
      setXStep("follow");
    } else if (xStep === "verify") {
      setXStep("post");
    } else if (xStep === "follow") {
      setXStep("signin");
    }
  };

  const handleConfirm = () => {
    if (xStep === "success" || isVerified) {
      setIsVerfied(true);
      onNextStep();
    } else if (xStep === "follow") {
      setXStep("post");
    } else if (xStep === "post") {
      setXStep("verify");
    } else if (xStep === "signin") {
      window.location.href = "/api/social/twitter?action=initiate";
      return;
    } else if (xStep === "verify") {
      const { isError: isPostLinkError, error: postLinkError } =
        isValidPostLink(tweetLink, "x");

      if (isPostLinkError) {
        setTweetLinkError({ isError: isPostLinkError, error: postLinkError });
        return;
      }

      verifyTweet(
        {
          tweetLink: tweetLink,
        },
        {
          onSuccess: () => {
            setXStep("success");
          },
          onError: (error) => {
            setTweetLinkError({ isError: true, error: error.message });
          },
        }
      );
      return;
    }
  };

  const buttonContent = isCompletingTwitterOAuth
    ? "Authenticating..."
    : isVerifyingTweet
      ? "Verifying..."
      : xStep === "post"
        ? "Continue"
        : xStep === "signin"
          ? "Sign in to X"
          : xStep === "verify"
            ? "Verify"
            : "Next";

  const isBtnLoadiing = isCompletingTwitterOAuth || isVerifyingTweet;

  useEffect(() => {
    if (isVerified && xStep !== "success") {
      setXStep("success");
    }
  }, [isVerified, xStep]);

  useEffect(() => {
    if (
      userStatus?.data?.twitterUsername &&
      userStatus?.data?.twitterId &&
      xStep === "signin"
    ) {
      setXStep("follow");
    }
  }, [userStatus?.data?.twitterUsername, userStatus?.data?.twitterId, xStep]);

  return (
    <TabsContent className="w-full mt-2 space-y-6" value="x">
      <SectionMetaInfo items={Action_LIST} />
      <SectionAction
        title={X_TITLE_MAP[xStep].title}
        description={X_TITLE_MAP[xStep].description}
        icon={IconsNames.X_SOCIAL}
        isSuccess={xStep === "success" || isVerified}
        isCollapsibleOpen={xStep === "verify"}
      >
        <div className="space-y-1">
          <Input
            aria-invalid={tweetLinkError.isError}
            value={tweetLink}
            onChange={(e) => setTweetLink(e.target.value)}
            placeholder="Your x tweet link"
            disabled={isVerifyingTweet}
            readOnly={false}
            endContent={isVerifyingTweet ? <Loader loaderSize={16} /> : null}
          />
          {tweetLinkError.isError && tweetLinkError.error && (
            <p className="text-destructive mt-1 text-xs font-normal leading-[1.5] tracking-xxs line-clamp-1">
              {tweetLinkError.error}
            </p>
          )}
        </div>
      </SectionAction>
      <ButtonsFooter>
        <Button variant="secondary" onClick={onBack} className="cursor-pointer">
          Back
        </Button>
        <Button
          asChild={xStep === "follow" || xStep === "post"}
          onClick={handleConfirm}
          className="cursor-pointer"
          disabled={isBtnLoadiing}
        >
          {xStep === "follow" ? (
            <a
              key="follow"
              href={X_VMCC_DAO_PAGE_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow
            </a>
          ) : xStep === "post" ? (
            <a
              key="post"
              href={X_POST_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Post
            </a>
          ) : (
            buttonContent
          )}
        </Button>
      </ButtonsFooter>
    </TabsContent>
  );
}
