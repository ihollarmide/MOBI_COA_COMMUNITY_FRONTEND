import { IconsNames } from "@/components/icons/icon.types";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useEffect, useState } from "react";
import { isValidReferralCode } from "../lib/utils";
import { SectionAction } from "./section-action";
import Image from "next/image";
import { ButtonsFooter } from "./buttons-footer";
import { useGetUplineId } from "../usecases/GetUplineId.usecase";
import { useSetUplineId } from "../usecases/SetUplineId.usecase";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import {
  useGetVmccDetailsByCoaUserId,
  useRetrieveVmccDetailsByCoaUserIdMutation,
} from "@/modules/auth/usecases/GetVmccDetailsByCoaUserId.usecase";

const getTitleMap = (referredBy: string) => ({
  submit: {
    title: "Enter Referral Code",
    description:
      "Please enter your referrer’s unique code in the input box below.",
  },
  confirm: {
    title: "Confirm Referral Code",
    description:
      "Please review your referrer’s details in the input box below.",
  },
  success: {
    title: "Referral Code Confirmed!",
    description: `Referred by: ${referredBy}`,
  },
});

function ConfirmedReferralCode({
  vmccName,
  vmccLogo,
  coaUserId,
}: {
  vmccName: string;
  vmccLogo: string;
  coaUserId: number;
}) {
  return (
    <div className="w-full min-h-[46px] bg-glass-gradient border-border/[0.05] border-solid px-3 py-[12.5px] rounded-lg flex items-center justify-start gap-x-2">
      <Image
        src={vmccLogo}
        alt={vmccName}
        width={20}
        height={20}
        className="size-5 object-cover rounded-full shrink-0"
      />
      <div className="overflow-hidden text-white text-sm font-medium leading-[1.5] tracking-sm">
        <p className="">
          <span className="">{vmccName}</span>{" "}
          <span className="text-[#929292]">
            MCL{coaUserId.toString().padStart(6, "0")}
          </span>
        </p>
      </div>
    </div>
  );
}

export function ReferralCode() {
  const { address } = useWalletConnectionStatus();
  const { data: uplineId } = useGetUplineId();
  const { handleSetUpline, isLoading: isSettingUpline } = useSetUplineId({
    onSuccess: () => {
      setReferralCodeError({
        isError: false,
        error: null,
      });
      setPage("success");
    },
    onError: (error) => {
      setPage("submit");
      setReferralCodeError({
        isError: true,
        error: error.message,
      });
    },
    onGenericError: () => {
      setPage("submit");
      setReferralCodeError({
        isError: true,
        error: "Unable to apply referral code",
      });
    },
  });
  const [referralCode, setReferralCode] = useState("");
  const [page, setPage] = useState<"submit" | "confirm" | "success">("submit");
  const [referralCodeError, setReferralCodeError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });
  const [, setOnboardingUrlStates] = useOnboardingUrlStates();

  const {
    mutate: retrieveVmccDetails,
    data: checkedVmccDetails,
    variables: checkedVmccDetailsVariables,
    isPending: isCheckingVmccDetails,
  } = useRetrieveVmccDetailsByCoaUserIdMutation();

  const getNumberFromReferralCode = (referralCode: string): number => {
    // Remove "MCL" prefix and convert remaining digits to number
    const digitsPart = referralCode.slice(3); // Remove "MCL"
    return parseInt(digitsPart, 10); // Convert to number, automatically removes leading zeros
  };

  const { data: vmccDetails } = useGetVmccDetailsByCoaUserId({
    coaUserId: uplineId ?? getNumberFromReferralCode(referralCode),
    enabled: uplineId
      ? !!uplineId
      : !isValidReferralCode(referralCode).isError &&
        !!getNumberFromReferralCode(referralCode),
  });

  const handleBack = () => {
    if (page === "submit") {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "follow-us",
      }));
    } else if (page === "confirm") {
      setPage("submit");
    } else if (page === "success") {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "follow-us",
      }));
    }
  };

  const handleConfirm = () => {
    if (!address) return;

    if (page === "submit") {
      const { isError, error } = isValidReferralCode(referralCode);
      if (isError) {
        setReferralCodeError({ isError, error });
        return;
      }

      const coaUserId = getNumberFromReferralCode(referralCode);

      if (!!coaUserId) {
        setReferralCodeError({
          isError: false,
          error: null,
        });
        retrieveVmccDetails(coaUserId, {
          onSuccess: () => {
            setPage("confirm");
          },
        });
      } else {
        setReferralCodeError({
          isError: true,
          error: "Invalid referral code",
        });
      }
    } else if (page === "confirm") {
      const coaUserId = getNumberFromReferralCode(referralCode);
      if (!!coaUserId) {
        setReferralCodeError({
          isError: false,
          error: null,
        });
        handleSetUpline({
          coaUserId,
          address: address,
        });
      } else {
        setReferralCodeError({
          isError: true,
          error: "Invalid referral code",
        });
      }
    } else if (page === "success") {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "claim-genesis-key",
      }));
    }
  };

  const referredBy =
    vmccDetails && !!uplineId
      ? `${vmccDetails.data?.companyName ?? "N/A"} (MCL${uplineId?.toString().padStart(6, "0")})`
      : "N/A";

  useEffect(() => {
    if (!!uplineId && page !== "success") {
      setPage("success");
    }
  }, [page, uplineId]);

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
        inputPlaceholder="Enter Referral Code (e.g. MCL000000)"
        onInputChange={setReferralCode}
        inputValue={referralCode}
        isInputLoading={isCheckingVmccDetails}
        collapsibleContent={
          page === "confirm" &&
          checkedVmccDetailsVariables &&
          !!checkedVmccDetails ? (
            <ConfirmedReferralCode
              vmccName={checkedVmccDetails.data?.companyName ?? "N/A"}
              vmccLogo={checkedVmccDetails.data?.companyLogo ?? ""}
              coaUserId={Number(checkedVmccDetailsVariables)}
            />
          ) : null
        }
      />

      <ButtonsFooter>
        <Button
          variant="secondary"
          onClick={handleBack}
          className="cursor-pointer"
          disabled={isSettingUpline}
        >
          {page === "confirm" ? "Edit Referral Code" : "Back"}
        </Button>
        <Button
          disabled={
            !!uplineId
              ? false
              : (page === "submit" &&
                  isValidReferralCode(referralCode).isError) ||
                isSettingUpline
          }
          onClick={handleConfirm}
          className="cursor-pointer"
        >
          {isSettingUpline ? (
            "Applying Referral Code"
          ) : (
            <>
              {page === "submit"
                ? "Submit Code"
                : page === "confirm"
                  ? "Confirm Code"
                  : "Next"}
            </>
          )}
        </Button>
      </ButtonsFooter>
    </section>
  );
}
