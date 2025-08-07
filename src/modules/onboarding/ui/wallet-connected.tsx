import { Icon } from "@/components/icons/icon";
import { IconsNames } from "@/components/icons/icon.types";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { truncateAddress } from "@/lib/utils";
import { useDisconnect } from "wagmi";
import { useOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";

export function WalletConnected() {
  const { disconnect } = useDisconnect();
  const { address } = useWalletConnectionStatus();
  const [, setOnboardingUrlStates] = useOnboardingUrlStates();

  const handleChangeWallet = () => {
    disconnect();
  };

  const handleConfirm = () => {
    setOnboardingUrlStates((prev) => ({
      ...prev,
      step: "join-telegram",
    }));
  };

  if (!address) {
    return null;
  }

  return (
    <section className="w-full space-y-8 text-center flex flex-col items-center justify-center @container">
      <div className="space-y-1">
        <SectionTitle>Wallet Connected!</SectionTitle>
        <p className="text-gray-200 text-sm leading-[1.4] tracking-sm">
          Verify you have the right BEP20 wallet connected.
        </p>
      </div>

      <div className="flex flex-col justify-center items-center space-y-4 text-white font-medium tracking-[0.18px]">
        <Icon
          name={IconsNames.SUCCESS}
          width={69}
          height={69}
          className="shrink-0"
        />
        <p className="">{truncateAddress(address)}</p>
      </div>

      <div className="w-full grid @sm:grid-cols-2 gap-y-4 gap-x-2 @md:gap-x-3.5">
        <Button
          variant="secondary"
          onClick={handleChangeWallet}
          className="cursor-pointer"
        >
          Change Wallet
        </Button>
        <Button onClick={handleConfirm} className="cursor-pointer">
          Confirm &amp; Continue
        </Button>
      </div>
    </section>
  );
}
