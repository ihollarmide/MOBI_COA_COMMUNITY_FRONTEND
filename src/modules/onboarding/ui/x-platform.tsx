import { TabsContent } from "@/components/ui/tabs";
import { SectionMetaInfo } from "./section-meta-info";
import { SectionAction } from "./section-action";
import { useEffect, useState } from "react";
import { IconsNames } from "@/components/icons/icon.types";
import { ButtonsFooter } from "./buttons-footer";
import { Button } from "@/components/ui/button";
import { TWITTER_LINK } from "@/common/constants";
import { useVerifyTwitter } from "../usecases/VerifyTwitter.usecase";
import { useCompleteTwitterOAuth } from "../hooks/useCompleteTwitterOAuth";
import { isValidPostLink, isValidUsernameWithAtSign } from "../lib/utils";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";

type XPageState = "follow" | "post" | "signin" | "verify" | "success";

export const TWITTER_POST =
  "'The VMCC Builder DAO is a global community of Virtual Mining & Construction Companies tokenizing residential, commercial & industrial assets. Get a free Genesis Key ($350 value) with Referral Code: MCL-000003 #VMCC #VMCCAirdrop #BuildersDAO #MOBIAutomation'";

export const X_TITLE_MAP = {
  follow: {
    title: "Follow us on X",
    description: `Click "Follow" to join our X community`,
  },
  post: {
    title: "Post this tweet and copy the link",
    description: `Post this tweet: ${TWITTER_POST}`,
  },
  signin: {
    title: "Sign in to X",
    description: "Sign in to your X account to confirm your follow and tweet.",
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
  `Click the "Follow" button to access X. This button redirects you to the X app on your device and enables you to join the community.`,
  "After following, post a tweet and copy the link to the tweet and paste it in the input box",
  `Click "Verify" to confirm you've followed the page and posted the tweet`,
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
  const [username, setUsername] = useState<string>("");
  const [tweetLink, setTweetLink] = useState<string>("");
  const [twitterId, setTwitterId] = useState<string | number | null>(null);
  const [tweetLinkError, setTweetLinkError] = useState<{
    isError: boolean;
    error: string | null;
  }>({ isError: false, error: null });
  const [usernameError, setUsernameError] = useState<{
    isError: boolean;
    error: string | null;
  }>({ isError: false, error: null });
  const { mutate: verifyTwitter, isPending: isVerifyXPending } =
    useVerifyTwitter();
  const { isCompletingTwitterOAuth } = useCompleteTwitterOAuth({
    onSuccess: (data) => {
      setTwitterId(data.user.id);
      setUsername(data.user.username);
      setPage("verify");
    },
  });
  const [page, setPage] = useState<XPageState>("follow");

  const onBack = () => {
    if (page === "follow" || page === "success" || isVerified) {
      onPrevStep();
    } else if (page === "post") {
      setPage("follow");
    } else if (page === "signin") {
      setPage("post");
    } else if (page === "verify") {
      setPage("signin");
    }
  };

  const handleConfirm = () => {
    if (page === "success" || isVerified) {
      setIsVerfied(true);
      onNextStep();
    } else if (page === "follow") {
      setPage("post");
    } else if (page === "post") {
      setPage("signin");
    } else if (page === "signin") {
      window.location.href = "/api/auth/twitter?action=initiate";
      return;
    } else if (page === "verify") {
      const { isError: isPostLinkError, error: postLinkError } =
        isValidPostLink(tweetLink, "x");
      const { isError, error: validationError } = isValidUsernameWithAtSign(
        username,
        "x"
      );

      if (isPostLinkError || isError) {
        setTweetLinkError({ isError: isPostLinkError, error: postLinkError });
        setUsernameError({ isError, error: validationError });
        return;
      }

      if (!twitterId) {
        setUsernameError({ isError: true, error: "Twitter ID is required" });
        return;
      }

      verifyTwitter(
        {
          username: username,
          twitterId: twitterId,
          tweetLink: tweetLink,
        },
        {
          onSuccess: () => {
            setPage("success");
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
    : isVerifyXPending
      ? "Verifying..."
      : page === "post"
        ? "Continue"
        : page === "signin"
          ? "Sign in to X"
          : page === "verify"
            ? "Verify"
            : "Next";

  const isBtnLoadiing = isCompletingTwitterOAuth || isVerifyXPending;

  useEffect(() => {
    if (isVerified && page !== "success") {
      setPage("success");
    }
  }, [isVerified, page]);

  return (
    <TabsContent className="w-full mt-2 space-y-6" value="x">
      <SectionMetaInfo items={Action_LIST} />
      <SectionAction
        title={X_TITLE_MAP[page].title}
        description={X_TITLE_MAP[page].description}
        icon={IconsNames.X_SOCIAL}
        isSuccess={page === "success" || isVerified}
        isCollapsibleOpen={page === "verify"}
      >
        <div className="space-y-2.5">
          <div className="space-y-1">
            <Input
              aria-invalid={usernameError.isError}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your x username"
              disabled={isVerifyXPending}
              readOnly={true}
              endContent={isVerifyXPending ? <Loader loaderSize={16} /> : null}
            />
            {usernameError.isError && usernameError.error && (
              <p className="text-destructive mt-1 text-xs font-normal leading-[1.5] tracking-xxs line-clamp-1">
                {usernameError.error}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Input
              aria-invalid={tweetLinkError.isError}
              value={tweetLink}
              onChange={(e) => setTweetLink(e.target.value)}
              placeholder="Your x tweet link"
              disabled={isVerifyXPending}
              readOnly={false}
              endContent={isVerifyXPending ? <Loader loaderSize={16} /> : null}
            />
            {tweetLinkError.isError && tweetLinkError.error && (
              <p className="text-destructive mt-1 text-xs font-normal leading-[1.5] tracking-xxs line-clamp-1">
                {tweetLinkError.error}
              </p>
            )}
          </div>
        </div>
      </SectionAction>
      <ButtonsFooter>
        <Button variant="secondary" onClick={onBack} className="cursor-pointer">
          Back
        </Button>
        <Button
          asChild={page === "follow"}
          onClick={handleConfirm}
          className="cursor-pointer"
          disabled={isBtnLoadiing}
        >
          {page === "follow" ? (
            <a href={TWITTER_LINK} target="_blank" rel="noopener noreferrer">
              Follow
            </a>
          ) : (
            buttonContent
          )}
        </Button>
      </ButtonsFooter>
    </TabsContent>
  );
}
