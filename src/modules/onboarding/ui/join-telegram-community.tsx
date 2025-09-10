import { IconsNames } from "@/components/icons/icon.types";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useEffect, useState } from "react";
import { isValidUsernameWithAtSign, removeAtSign } from "../lib/utils";
import { CITY_OF_ATLANTUS_TELEGRAM_LINK } from "@/common/constants";
import { SectionAction } from "./section-action";
import { SectionMetaInfo } from "./section-meta-info";
import { ButtonsFooter } from "./buttons-footer";
import { useVerifyTelegramMembership } from "../usecases/VerifyTelegramMembership.usecase";
import { useGetAuthStatus } from "@/modules/auth/usecases/GetAuthStatus.usecase";
import { TelegramButton } from "./telegram-button";
import { TelegramAuthResponse } from "@/types";
import { toast } from "sonner";
import { TelegramSteps } from "../types";

const TITLE_MAP = {
  join: {
    title: "Join our Telegram Community",
    description:
      "Click “Join Community” to become a part of the Atlantus City Hall Community.",
  },
  signin: {
    title: "Confirm Atlantus City Hall Membership by signing in with Telegram",
    description: "Login to your Telegram account to get your telegram details.",
  },
  verify: {
    title: "Verify Atlantus City Hall Membership",
    description: "Confirm your Telegram username to verify your membership.",
  },
  success: {
    title: "Your telegram account has been verified!",
    description: "Click “Next” to continue.",
  },
};

const JOIN_ACTION_LIST = [
  "Click the “Join” button to access the Atlantus City Hall Telegram community. This button redirects you to the Telegram app on your device and enables you to join the community.",
  "After joining, come back to this window and Click “Sign in with Telegram” to login to your Telegram account.",
  "Click “Verify” to confirm your membership.",
  "Click “Next” to proceed to the next action.",
];

export function JoinTelegramCommunity() {
  const [username, setUsername] = useState("");
  const [telegramId, setTelegramId] = useState<string | number | null>(null);
  const { data: authStatus } = useGetAuthStatus();

  const isTelegramVerified =
    !!authStatus?.data?.telegramJoined &&
    !!authStatus?.data?.telegramId &&
    !!authStatus?.data?.telegramUsername;

  const { mutate: verifyTelegram, isPending: isVerifyingMembership } =
    useVerifyTelegramMembership();

  const [usernameError, setUsernameError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });
  const [{ telegram: telegramStep }, setOnboardingUrlStates] =
    useOnboardingUrlStates();

  const setTelegramStep = (step: TelegramSteps) => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      telegram: step,
    }));
  };

  const handleBack = () => {
    if (
      telegramStep === "success" ||
      telegramStep === "join" ||
      isTelegramVerified
    ) {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "wallet-connected",
      }));
    } else if (telegramStep === "verify") {
      setTelegramStep("signin");
    } else if (telegramStep === "signin") {
      setTelegramStep("join");
    }
  };

  const handleConfirmTelegramUsername = () => {
    const { isError, error } = isValidUsernameWithAtSign(username, "telegram");
    if (isError) {
      setUsernameError({ isError, error });
      return;
    }
    setUsernameError({ isError: false, error: null });
    if (!telegramId) {
      setUsernameError({ isError: true, error: "Telegram ID is required" });
      return;
    }
    verifyTelegram(
      {
        telegramJoined: true,
        telegramUsername: removeAtSign(username),
        telegramId: telegramId ?? "",
      },
      {
        onSuccess: () => {
          setTelegramStep("success");
        },
        onError: (error) => {
          setUsernameError({ isError: true, error: error.message });
        },
      }
    );
  };

  const onTelegramAuthSuccess = (data: TelegramAuthResponse) => {
    if (!data.username) {
      toast.error("You do not have a Telegram username", {
        description:
          "Please go to your Telegram app and add a username and try again.",
        id: "telegram-auth-success",
      });
      setUsernameError({
        isError: true,
        error: "You do not have a Telegram username",
      });
      return;
    }
    setUsernameError({
      isError: false,
      error: null,
    });
    setUsername(data.username);
    setTelegramId(data.id);
    setTelegramStep("verify");
  };

  useEffect(() => {
    if (isTelegramVerified && telegramStep !== "success") {
      setTelegramStep("success");
    }
  }, [isTelegramVerified, telegramStep]);

  return (
    <section className="w-full space-y-6 @container">
      <div className="space-y-2">
        <SectionTitle className="text-center">
          Join our Telegram Community
        </SectionTitle>
        <SectionMetaInfo items={JOIN_ACTION_LIST} />
      </div>

      <SectionAction
        title={TITLE_MAP[telegramStep].title}
        description={TITLE_MAP[telegramStep].description}
        icon={IconsNames.TELEGRAM}
        isSuccess={telegramStep === "success"}
        isCollapsibleOpen={telegramStep === "verify"}
        inputValue={username}
        onInputChange={setUsername}
        isInputReadOnly={true}
        isInputLoading={isVerifyingMembership}
        inputPlaceholder="Your Telegram @username"
        isError={usernameError.isError}
        errorMessage={usernameError.error}
      />

      <ButtonsFooter>
        <Button
          variant="secondary"
          onClick={handleBack}
          className="cursor-pointer"
        >
          Back
        </Button>
        {telegramStep === "signin" ? (
          <TelegramButton onSuccess={onTelegramAuthSuccess} />
        ) : null}
        {telegramStep === "verify" ? (
          <Button
            onClick={handleConfirmTelegramUsername}
            disabled={isVerifyingMembership}
          >
            {isVerifyingMembership ? "Verifying Membership..." : "Verify"}
          </Button>
        ) : null}
        {telegramStep === "success" ? (
          <Button
            onClick={() => {
              setOnboardingUrlStates((prev) => ({
                ...prev,
                step: "follow-us",
              }));
            }}
          >
            Next
          </Button>
        ) : null}
        {telegramStep === "join" ? (
          <Button
            asChild={true}
            onClick={() => setTelegramStep("signin")}
            className="cursor-pointer"
          >
            <a
              href={CITY_OF_ATLANTUS_TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Community
            </a>
          </Button>
        ) : null}
      </ButtonsFooter>
    </section>
  );
}
