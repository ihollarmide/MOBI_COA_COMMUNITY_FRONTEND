import { Button } from "@/components/ui/button";
import { GenesisKeyGif } from "@/components/ui/genesis-key.gif";
import { SectionTitle } from "@/components/ui/section-title";
import Image from "next/image";
import { ButtonsFooter } from "./buttons-footer";
import { useGetIsClaimedKey } from "@/modules/onboarding/usecases/GetIsClaimedKey.usecase";
import { useClaimToken } from "@/modules/onboarding/usecases/ClaimToken.usecase";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useGetUplineId } from "../usecases/GetUplineId.usecase";
import { useGetVmccDetailsByCoaUserId } from "@/modules/auth/usecases/GetVmccDetailsByCoaUserId.usecase";
import { Loader } from "@/components/ui/loader";

export function ClaimKeys() {
  const { data: isClaimed, isPending } = useGetIsClaimedKey();
  const [, setOnboardingUrlStates] = useOnboardingUrlStates();
  const { data: uplineId } = useGetUplineId();

  const { data: vmccDetails } = useGetVmccDetailsByCoaUserId({
    coaUserId: uplineId || "",
    enabled: !!uplineId,
  });

  const { handleClaim, isLoading: isClaiming } = useClaimToken();

  const handleBack = () => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      step: "enter-referral-code",
    }));
  };

  const handleContinue = () => {
    if (isClaiming) return;

    if (isClaimed) {
      setOnboardingUrlStates((prev) => ({
        ...prev,
        step: "join-vmcc-dao",
      }));
    } else {
      handleClaim();
    }
  };

  return (
    <section className="w-full @container">
      <div className="space-y-2 text-center">
        <SectionTitle>Claim Yard Genesis Key</SectionTitle>
        <p className="text-sm leading-[1.4] tracking-sm text-gray-100">
          {isClaimed
            ? "You have already claimed"
            : "Confirm your referrer and claim your Yard Genesis Key."}
        </p>
      </div>

      <div className="w-full flex flex-col items-center justify-center mb-8">
        <GenesisKeyGif
          batch={1}
          type="yard"
          width={203}
          height={167}
          imageClassName="w-[203px] h-auto"
        />
        {vmccDetails && !!uplineId ? (
          <div className="w-full flex items-center justify-center gap-x-1 flex-wrap text-center -mt-2">
            <p className="text-sm leading-[1.4] tracking-sm text-gray-100">
              Referred by:
            </p>
            <div className="flex items-center justify-center gap-x-2">
              <Image
                src={vmccDetails?.data?.companyLogo || ""}
                alt={vmccDetails?.data?.companyName || ""}
                width={20}
                height={20}
                className="size-5 object-cover rounded-full shrink-0"
              />
              <div className="overflow-hidden text-white text-sm font-medium leading-[1.5] tracking-sm flex">
                {vmccDetails.data?.companyName ?? "N/A"}
                &nbsp;
                <span className="text-[#929292]">
                  (MCL{uplineId?.toString().padStart(6, "0")})
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Loader label="Loading Referral details..." />
        )}
      </div>

      <ButtonsFooter>
        <Button
          variant="secondary"
          className="cursor-pointer"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          disabled={isPending || isClaiming}
          className="cursor-pointer"
          onClick={handleContinue}
        >
          {!!isClaimed ? "Continue" : isClaiming ? "Claiming..." : "Claim"}
        </Button>
      </ButtonsFooter>
    </section>
  );
}
