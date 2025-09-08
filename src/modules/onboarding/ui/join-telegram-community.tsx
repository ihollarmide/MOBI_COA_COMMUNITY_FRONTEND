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

  const { mutate: verifyTelegram, isPending: isVerifyingMembership } =
    useVerifyTelegramMembership();

  const [page, setPage] = useState<"join" | "verify" | "signin" | "success">(
    "join"
  );
  const [usernameError, setUsernameError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });
  const [, setOnboardingUrlStates] = useOnboardingUrlStates();

  const handleBack = () => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      step: "wallet-connected",
    }));
  };

  // const handleConfirm = (telegramUserName?: string) => {
  //   if (page === "join") {
  //     setPage("verify");
  //   } else if (page === "verify") {
  //     const { isError, error } = isValidUsernameWithAtSign(
  //       telegramUserName ?? username,
  //       "telegram"
  //     );
  //     if (isError) {
  //       setUsernameError({ isError, error });
  //       return;
  //     }
  //     setUsernameError({ isError: false, error: null });
  //     verifyTelegram(
  //       {
  //         username: telegramUserName ? removeAtSign(telegramUserName) : removeAtSign(username),
  //       },
  //       {
  //         onSuccess: () => {
  //           setPage("success");
  //         },
  //         onError: (error) => {
  //           setUsernameError({ isError: true, error: error.message });
  //         },
  //       }
  //     );
  //   } else if (page === "success") {
  //     setOnboardingUrlStates((prev) => ({
  //       ...prev,
  //       step: "follow-us",
  //     }));
  //   }
  // };

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
          setPage("success");
        },
        onError: (error) => {
          setUsernameError({ isError: true, error: error.message });
        },
      }
    );
  };

  const onTelegramAuthSuccess = (data: TelegramAuthResponse) => {
    // console.log("data in auth success", data);
    setUsername(data.username);
    setTelegramId(data.id);
    setPage("verify");
    // handleConfirmTelegramUsername(data.username);
  };

  useEffect(() => {
    if (
      authStatus?.data?.telegramJoined &&
      authStatus?.data?.telegramId &&
      page !== "success"
    ) {
      setPage("success");
    }
  }, [authStatus?.data?.telegramJoined, authStatus?.data?.telegramId, page]);

  return (
    <section className="w-full space-y-6 @container">
      <div className="space-y-2">
        <SectionTitle className="text-center">
          Join our Telegram Community
        </SectionTitle>
        <SectionMetaInfo items={JOIN_ACTION_LIST} />
      </div>

      <SectionAction
        title={TITLE_MAP[page].title}
        description={TITLE_MAP[page].description}
        icon={IconsNames.TELEGRAM}
        isSuccess={page === "success"}
        isCollapsibleOpen={page === "verify"}
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
        {page === "signin" ? (
          <TelegramButton onSuccess={onTelegramAuthSuccess} />
        ) : null}
        {page === "verify" ? (
          <Button
            onClick={handleConfirmTelegramUsername}
            disabled={isVerifyingMembership}
          >
            {isVerifyingMembership ? "Verifying Membership..." : "Verify"}
          </Button>
        ) : null}
        {page === "success" ? (
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
        {page === "join" ? (
          <Button
            asChild={true}
            onClick={() => setPage("signin")}
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
