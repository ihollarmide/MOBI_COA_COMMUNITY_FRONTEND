import { Button } from "@/components/ui/button";
import { ButtonsFooter } from "./buttons-footer";
import { SectionTitle } from "@/components/ui/section-title";
import { useEffect, useMemo, useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { useGetAuthStatus } from "@/modules/auth/usecases/GetAuthStatus.usecase";
import { InputOTP } from "@/components/ui/input-otp";
import { OTPInputItem } from "./otp-input-item";
import { isOtpValid, isPhoneNumberValid } from "../lib/utils";
import { useRequestPhoneNumberVerification } from "../usecases/RequestPhoneNumberVerification.usecase";
import { useVerifyPhoneNumber } from "../usecases/VerifyPhoneNumber.usecase";
import { useOnboardingUrlStates } from "../hooks/useOnboardingUrlStates";
import { LoaderIcon } from "lucide-react";

export const TITLE_MAP = {
  "enter-phone-number": {
    title: "Phone Number Verification",
    description: "Please enter your phone number to verify your account.",
  },
  "verify-phone-number": {
    title: "OTP Verification",
    description: `Enter the OTP sent to your phone number on Whatsapp`,
  },
  success: {
    title: "Phone Number Verified",
    description: "Your phone number has been verified.",
  },
};

export function PhoneVerification() {
  const { data: authStatus } = useGetAuthStatus();
  const [, setOnboardingUrlStates] = useOnboardingUrlStates();
  const {
    mutate: requestPhoneNumberVerification,
    isPending: isRequestingPhoneNumberVerification,
  } = useRequestPhoneNumberVerification();
  const { mutate: verifyPhoneNumber, isPending: isVerifyingPhoneNumber } =
    useVerifyPhoneNumber();
  const [step, setStep] = useState<
    "enter-phone-number" | "verify-phone-number" | "success"
  >("enter-phone-number");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });
  const [otp, setOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<{
    isError: boolean;
    error: string | null;
  }>({
    isError: false,
    error: null,
  });

  const isPlatformVerified =
    !!authStatus?.data?.phoneNumberVerified && !!authStatus?.data?.phoneNumber;

  const handleBack = () => {
    if (step === "success" || step === "enter-phone-number") {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "wallet-connected",
      }));
    } else if (step === "verify-phone-number") {
      setStep("enter-phone-number");
    }
  };

  const handleContinue = () => {
    if (step === "enter-phone-number") {
      const { isError, error } = isPhoneNumberValid(phoneNumber);
      if (isError) {
        setPhoneNumberError({ isError, error });
        return;
      }

      setPhoneNumberError({ isError: false, error: null });
      requestPhoneNumberVerification(
        { phoneNumber },
        {
          onSuccess: () => {
            setStep("verify-phone-number");
          },
          onError: (error) => {
            setPhoneNumberError({ isError: true, error: error.message });
          },
        }
      );
    } else if (step === "verify-phone-number") {
      const { isError, error } = isOtpValid(otp);
      if (isError) {
        setOtpError({ isError, error });
        return;
      }

      if (!phoneNumber) {
        setOtpError({ isError: true, error: "Phone number is required" });
        return;
      }

      setOtpError({ isError: false, error: null });
      verifyPhoneNumber(
        { phone: phoneNumber, code: otp },
        {
          onSuccess: () => {
            setStep("success");
          },
          onError: (error) => {
            setOtpError({ isError: true, error: error.message });
          },
        }
      );
    } else if (step === "success") {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "join-telegram",
      }));
    }
  };

  useEffect(() => {
    if (isPlatformVerified && step !== "success") {
      setStep("success");
    }
  }, [isPlatformVerified, step]);

  const isLoading =
    isRequestingPhoneNumberVerification || isVerifyingPhoneNumber;

  const buttonText = useMemo(() => {
    if (step === "success") {
      return "Next";
    }
    if (isRequestingPhoneNumberVerification) {
      return "Requesting OTP...";
    } else if (isVerifyingPhoneNumber) {
      return "Verifying OTP...";
    }

    if (step === "enter-phone-number") {
      return "Request OTP";
    }
    if (step === "verify-phone-number") {
      return "Verify OTP";
    }
    return "Next";
  }, [isRequestingPhoneNumberVerification, isVerifyingPhoneNumber, step]);

  return (
    <section className="w-full space-y-6 @container">
      <div className="space-y-2 text-center">
        <SectionTitle>{TITLE_MAP[step].title}</SectionTitle>
        <p className="text-sm tracking-sm font-normal leading-[1.4] text-gray-100">
          {TITLE_MAP[step].description}
        </p>
      </div>

      {step === "enter-phone-number" && (
        <div className="max-w-[330px] w-full mx-auto space-y-2">
          <PhoneInput
            value={phoneNumber}
            onChange={setPhoneNumber}
            defaultCountry="US"
            placeholder="Enter your phone number"
            international={true}
            readOnly={isLoading}
            aria-invalid={phoneNumberError.isError}
          />
          {phoneNumberError.isError && phoneNumberError.error && (
            <p className="text-destructive mt-1 text-xs font-normal leading-[1.5] tracking-xxs line-clamp-1">
              {phoneNumberError.error}
            </p>
          )}
        </div>
      )}

      {step === "verify-phone-number" && (
        <div className="max-w-[330px] w-full mx-auto space-y-2">
          <InputOTP
            containerClassName="grid grid-cols-6 gap-x-1.5 h-12"
            maxLength={6}
            value={otp}
            onChange={setOtp}
            readOnly={isLoading}
            aria-invalid={otpError.isError}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <OTPInputItem
                key={index}
                isCodeError={otpError.isError}
                index={index}
              />
            ))}
          </InputOTP>
          {otpError.isError && otpError.error && (
            <p className="text-destructive mt-1 text-xs font-normal leading-[1.5] tracking-xxs line-clamp-1">
              {otpError.error}
            </p>
          )}
        </div>
      )}

      <ButtonsFooter>
        <Button
          variant="secondary"
          className="cursor-pointer"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button onClick={handleContinue} disabled={isLoading}>
          {buttonText}
          {isLoading ? <LoaderIcon size={16} className="animate-spin" /> : null}
        </Button>
      </ButtonsFooter>
    </section>
  );
}
