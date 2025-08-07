import { IconsNames } from "@/components/icons/icon.types";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useEffect, useState } from "react";
import {
  getTelegramUserVerifiedKey,
  isValidUsernameWithAtSign,
} from "../lib/utils";
import { useChainId } from "wagmi";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useSessionStorage } from "@/shared/hooks";
import { CITY_OF_ATLANTUS_TELEGRAM_LINK } from "@/constants";
import { SectionAction } from "./section-action";
import { SectionMetaInfo } from "./section-meta-info";

const TITLE_MAP = {
  join: {
    title: "Join our Telegram Community",
    description:
      "Click “Join Now” to become a part of the Atlantus City Hall Community.",
  },
  verify: {
    title: "Confirm Atlantus City Hall Membership",
    description: "Enter your Telegram username to verify your membership.",
  },
  success: {
    title: "Your telegram account has been verified!",
    description: "Move on to the next step to claim your airdrop.",
  },
};

const JOIN_ACTION_LIST = [
  "Click the “Join” button to access the Atlantus City Hall Telegram community. This button redirects you to the Telegram app on your device and enables you to join the community.",
  "After joining, come back to this window and enter your Telegram username in the input box.",
  "Click “Verify” to validate your membership.",
  "Click “Next” to proceed to the next action.",
];

export function JoinTelegramCommunity() {
  const chainId = useChainId();
  const { address } = useWalletConnectionStatus();
  const [username, setUsername] = useState("");
  const { set: setTelegramUserVerified, value: telegramUserVerified } =
    useSessionStorage(
      getTelegramUserVerifiedKey({
        chainId,
        address: address ?? "",
      })
    );
  const [page, setPage] = useState<"join" | "verify" | "success">(
    telegramUserVerified === true ? "success" : "join"
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

  const handleConfirm = () => {
    if (page === "join") {
      setPage("verify");
    } else if (page === "verify") {
      const { isError, error } = isValidUsernameWithAtSign(username);
      if (isError) {
        setUsernameError({ isError, error });
        return;
      }
      setUsernameError({ isError: false, error: null });
      // TODO: call api to verify username
      setPage("success");
      setTelegramUserVerified(true);
      // Store in session storage that user has verified their telegram account
    } else if (page === "success") {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "follow-us",
      }));
    }
  };

  useEffect(() => {
    if (telegramUserVerified === true && page !== "success") {
      setPage("success");
    }
  }, [telegramUserVerified, page]);

  return (
    <section className="w-full space-y-6 @container">
      <div className="space-y-2">
        <SectionTitle className="text-center">
          {page === "success"
            ? "Join Our Communities"
            : "Join our Telegram Community"}
        </SectionTitle>
        <SectionMetaInfo items={JOIN_ACTION_LIST} />
      </div>

      <SectionAction
        title={TITLE_MAP[page].title}
        description={TITLE_MAP[page].description}
        icon={IconsNames.TELEGRAM}
        isSuccess={page === "success"}
        isCollapsibleOpen={page === "verify"}
        isError={usernameError.isError}
        errorMessage={usernameError.error}
        inputPlaceholder="Your Telegram @username"
        onInputChange={setUsername}
        inputValue={username}
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
          asChild={page === "join"}
          onClick={handleConfirm}
          className="cursor-pointer"
        >
          {page === "join" ? (
            <a
              href={CITY_OF_ATLANTUS_TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Community
            </a>
          ) : page === "verify" ? (
            "Verify"
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </section>
  );
}
