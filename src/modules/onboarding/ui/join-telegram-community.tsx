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
import { useConfirmTelegramMembership } from "../usecases/ConfirmTelegramMembership.usecase";
import { useGetAuthStatus } from "@/modules/auth/usecases/GetAuthStatus.usecase";
import { TelegramSteps } from "../types";
import { useGetTelegramBotLink } from "../usecases/GetTelegramBotLink.usecase";
import { useAddTelegramUsername } from "../usecases/AddTelegramUsername.usecase";

const TITLE_MAP = {
  join: {
    title: "Join our Telegram Community",
    description:
      "Click “Join Community” to become a part of the Atlantus City Hall Community.",
  },
  submit: {
    title:
      "Confirm Atlantus City Hall Membership by entering your telegram username",
    description: "Enter your Telegram username and click Submit.",
  },
  verify: {
    title: "Verify Atlantus City Hall Membership by engaging the bot",
    description:
      "Confirm your Telegram username and community membership by clicking Verify and following the bot prompts.",
  },
  confirm: {
    title: "Confirm Atlantus City Hall Membership",
    description: "Confirm your membership by clicking Confirm.",
  },
  success: {
    title: "Your Telegram account has been verified!",
    description: "Click “Next” to continue.",
  },
};

const JOIN_ACTION_LIST = [
  "Click the “Join” button to access the Atlantus City Hall Telegram community. This button redirects you to the Telegram app on your device and enables you to join Atlantus City Hall",
  "After joining, come back to this window, enter your Telegram username and click Submit.",
  "Click “Verify” to confirm your membership, follow instructions from the bot and wait for verification.",
  "Click “Confirm” to confirm your membership.",
  "Click “Next” to proceed to the next action.",
];

export function JoinTelegramCommunity() {
  const [username, setUsername] = useState("");
  const { data: authStatus } = useGetAuthStatus();

  const { data: telegramBotLink, isPending: isGettingTelegramBotLink } =
    useGetTelegramBotLink();

  const isTelegramVerified =
    !!authStatus?.data?.telegramJoined &&
    !!authStatus?.data?.telegramId &&
    !!authStatus?.data?.telegramUsername;

  const {
    mutate: confirmTelegramMembership,
    isPending: isConfirmingMembership,
  } = useConfirmTelegramMembership();

  const { mutate: addTelegramUsername, isPending: isAddingTelegramUsername } =
    useAddTelegramUsername();

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
    } else if (telegramStep === "confirm") {
      setTelegramStep("verify");
    } else if (telegramStep === "verify") {
      setTelegramStep("submit");
    } else if (telegramStep === "submit") {
      setTelegramStep("join");
    }
  };

  const handleConfirmTelegramMembership = () => {
    confirmTelegramMembership(undefined, {
      onSuccess: () => {
        setTelegramStep("success");
      },
      onError: (error) => {
        setUsernameError({ isError: true, error: error.message });
      },
    });
  };

  const handleAddTelegramUsername = () => {
    const { isError, error } = isValidUsernameWithAtSign(username, "telegram");
    if (isError) {
      setUsernameError({ isError, error });
      return;
    }
    setUsernameError({ isError: false, error: null });

    addTelegramUsername(
      { username: removeAtSign(username) },
      {
        onSuccess: () => {
          setTelegramStep("verify");
        },
        onError: (error) => {
          setUsernameError({ isError: true, error: error.message });
        },
      }
    );
  };

  useEffect(() => {
    if (
      authStatus?.data?.telegramUsername &&
      (!username || username === "" || username.length === 0)
    ) {
      setUsername(authStatus?.data?.telegramUsername);
    }
  }, [authStatus?.data?.telegramUsername, username]);

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
        isCollapsibleOpen={
          telegramStep === "verify" ||
          telegramStep === "confirm" ||
          telegramStep === "submit"
        }
        inputValue={username || authStatus?.data?.telegramUsername || ""}
        onInputChange={setUsername}
        isInputReadOnly={telegramStep !== "submit"}
        isInputLoading={isConfirmingMembership || isAddingTelegramUsername}
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
        {telegramStep === "submit" ? (
          <Button
            onClick={handleAddTelegramUsername}
            disabled={isAddingTelegramUsername}
          >
            {isAddingTelegramUsername ? "Adding Telegram username..." : "Next"}
          </Button>
        ) : null}
        {telegramStep === "verify" ? (
          <Button
            asChild={true}
            disabled={isGettingTelegramBotLink || !telegramBotLink}
            onClick={() => setTelegramStep("confirm")}
          >
            {isGettingTelegramBotLink || !telegramBotLink ? (
              "Fetching bot link..."
            ) : (
              <a
                href={`${telegramBotLink?.botLink}/start`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Verify
              </a>
            )}
          </Button>
        ) : null}
        {telegramStep === "confirm" ? (
          <Button
            onClick={handleConfirmTelegramMembership}
            disabled={isConfirmingMembership}
          >
            {isConfirmingMembership ? "Confirming Membership..." : "Confirm"}
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
            onClick={() => setTelegramStep("submit")}
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
