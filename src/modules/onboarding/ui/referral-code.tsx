import { IconsNames } from "@/components/icons/icon.types";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useEffect, useState } from "react";
import { isValidReferralCode } from "../lib/utils";
import { SectionAction } from "./section-action";
import Image from "next/image";

const getTitleMap = (referredBy: string) => ({
  submit: {
    title: "Enter Referral Code",
    description:
      "Please enter your referrer’s unique code in the input box below.",
  },
  confirm: {
    title: "Confirm Referral Code",
    description:
      "Please enter your referrer’s unique code in the input box below.",
  },
  success: {
    title: "Referral Code Confirmed!",
    description: `Referred by: ${referredBy}`,
  },
});

function ConfirmedReferralCode() {
  return (
    <div className="w-full h-[46px] bg-glass-gradient border-border/[0.05] border-solid px-3 py-[12.5px] rounded-lg flex items-center justify-start gap-x-2">
      <Image
        src="/images/vmcc-sample-image.png"
        alt="VMCC"
        width={20}
        height={20}
        className="size-5 object-cover rounded-full shrink-0"
      />
      <div className="flex-1 overflow-hidden text-white text-sm font-medium leading-[1.5] tracking-sm">
        Atlantus Mining Works{" "}
        <span className="text-[#929292]">(MCL000213)</span>
      </div>
    </div>
  );
}

const isReferred = false;

export function ReferralCode() {
  const [referralCode, setReferralCode] = useState("");
  const [referredBy] = useState("");
  const [page, setPage] = useState<"submit" | "confirm" | "success">("submit");
  const [referralCodeError, setReferralCodeError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });
  const [, setOnboardingUrlStates] = useOnboardingUrlStates();

  const handleBack = () => {
    if (page === "submit") {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "follow-us",
      }));
    } else if (page === "confirm") {
      setPage("submit");
    } else if (page === "success") {
      setPage("confirm");
    }
  };

  const handleConfirm = () => {
    if (page === "submit") {
      const { isError, error } = isValidReferralCode(referralCode);
      if (isError) {
        setReferralCodeError({ isError, error });
        return;
      }

      // TODO: call api to submit referral code and verify
      setPage("confirm");
    } else if (page === "confirm") {
      setPage("success");
    } else if (page === "success") {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "claim-genesis-key",
      }));
    }
  };

  useEffect(() => {
    if (isReferred && page !== "success") {
      setPage("success");
    }
  }, [page]);

  return (
    <section className="w-full space-y-8 @container">
      <div className="space-y-2 text-center">
        <SectionTitle>Referral Code</SectionTitle>
        <p className="text-sm tracking-sm font-normal leading-[1.4] text-gray-100">
          The referrer information entered here is used for referral reward
          distribution. Please ensure you enter the correct code.
        </p>
      </div>

      <SectionAction
        title={getTitleMap(referredBy)[page].title}
        description={getTitleMap(referredBy)[page].description}
        icon={IconsNames.PASSCODE}
        isSuccess={page === "success"}
        isCollapsibleOpen={page !== "success"}
        isError={referralCodeError.isError}
        errorMessage={referralCodeError.error}
        inputPlaceholder="Enter Referral Code (e.g. MCL000213)"
        onInputChange={setReferralCode}
        inputValue={referralCode}
        collapsibleContent={
          page === "confirm" ? <ConfirmedReferralCode /> : null
        }
      />

      <div className="w-full grid @sm:grid-cols-2 gap-y-4 gap-x-2 @md:gap-x-3.5">
        <Button
          variant="secondary"
          onClick={handleBack}
          className="cursor-pointer"
        >
          {page === "confirm" ? "Edit Referral Code" : "Back"}
        </Button>
        <Button
          disabled={isValidReferralCode(referralCode).isError}
          onClick={handleConfirm}
          className="cursor-pointer"
        >
          {page === "submit"
            ? "Submit Code"
            : page === "confirm"
              ? "Confirm Code"
              : "Next"}
        </Button>
      </div>
    </section>
  );
}
