import { TabsContent } from "@/components/ui/tabs";
import { SectionMetaInfo } from "./section-meta-info";
import { SectionAction } from "./section-action";
import { useState } from "react";
import { IconsNames } from "@/components/icons/icon.types";
import { ButtonsFooter } from "./buttons-footer";
import { Button } from "@/components/ui/button";
import { INSTAGRAM_LINK } from "@/common/constants";
import { isValidUsernameWithAtSign } from "@/modules/onboarding/lib/utils";
import { useVerifyInstagram } from "@/modules/onboarding/usecases/VerifyInstagram.usecase";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { InstagramSteps } from "@/modules/onboarding/types";

export const IG_TITLE_MAP = {
  follow: {
    title: "Follow us on Instagram",
    description: `Click "Follow" to join our Instagram community`,
  },
  verify: {
    title: `Confirm Instagram Follow`,
    description: "Verify your Instagram username by clicking 'Verify'.",
  },
  success: {
    title: `Your Instagram account has been verified!`,
    description: `Move on to the next step to claim your airdrop.`,
  },
};

export const Action_LIST = [
  `Click the "Follow" button to access Instagram. This button redirects you to the Instagram app on your device and enables you to join the community.`,
  `After joining, come back to this window and enter your Instagram username in the input box.`,
  `Click "Verify" to confirm you've followed the page.`,
  `Click "Next" to proceed to the next action.`,
];

export function IGPlatform({
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
  const [{ instagram: instagramStep }, setOnboardingUrlStates] =
    useOnboardingUrlStates();
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<{
    isError: boolean;
    error: string | null;
  }>({ isError: false, error: null });
  const { mutate: verifyInstagram, isPending: isVerifyInstagramPending } =
    useVerifyInstagram();

  const setInstagramStep = (step: InstagramSteps) => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      instagram: step,
    }));
  };

  const onBack = () => {
    if (
      instagramStep === "follow" ||
      instagramStep === "success" ||
      isVerified
    ) {
      onPrevStep();
    } else if (instagramStep === "verify") {
      setInstagramStep("follow");
    }
  };

  const handleConfirm = () => {
    if (instagramStep === "success" || isVerified) {
      setIsVerfied(true);
      onNextStep();
    } else if (instagramStep === "follow") {
      setInstagramStep("verify");
    } else if (instagramStep === "verify") {
      const { isError, error: validationError } = isValidUsernameWithAtSign(
        username,
        "instagram"
      );

      if (isError) {
        setUsernameError({ isError, error: validationError });
        return;
      }

      verifyInstagram(
        {
          username: username,
        },
        {
          onSuccess: () => {
            setInstagramStep("success");
          },
          onError: (error) => {
            setUsernameError({ isError: true, error: error.message });
          },
        }
      );
      return;
    }
  };

  const buttonContent = isVerifyInstagramPending
    ? "Verifying..."
    : instagramStep === "verify"
      ? "Verify"
      : "Next";

  const isBtnLoadiing = isVerifyInstagramPending;

  return (
    <TabsContent className="w-full mt-2 space-y-6" value="instagram">
      <SectionMetaInfo items={Action_LIST} />
      <SectionAction
        title={IG_TITLE_MAP[instagramStep].title}
        description={IG_TITLE_MAP[instagramStep].description}
        icon={IconsNames.INSTAGRAM}
        isSuccess={instagramStep === "success" || isVerified}
        isCollapsibleOpen={instagramStep === "verify"}
        inputPlaceholder="Your instagram username"
        inputValue={username}
        onInputChange={setUsername}
        isError={usernameError.isError}
        errorMessage={usernameError.error}
        isInputLoading={isVerifyInstagramPending}
        isInputReadOnly={instagramStep === "success"}
      />
      <ButtonsFooter>
        <Button variant="secondary" onClick={onBack} className="cursor-pointer">
          Back
        </Button>
        <Button
          asChild={instagramStep === "follow"}
          onClick={handleConfirm}
          className="cursor-pointer"
          disabled={isBtnLoadiing}
        >
          {instagramStep === "follow" ? (
            <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer">
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
