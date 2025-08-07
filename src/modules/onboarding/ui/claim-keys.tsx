import { Button } from "@/components/ui/button";
import { GenesisKeyGif } from "@/components/ui/genesis-key.gif";
import { SectionTitle } from "@/components/ui/section-title";
import Image from "next/image";

export function ClaimKeys() {
  return (
    <section className="w-full @container">
      <div className="space-y-2 text-center">
        <SectionTitle>Claim Yard Genesis Key</SectionTitle>
        <p className="text-sm leading-[1.4] tracking-sm text-gray-100">
          Confirm your referrer and claim your Yard Genesis Key.
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
        <div className="w-full flex items-center justify-center gap-x-2 text-center">
          <Image
            src="/images/vmcc-sample-image.png"
            alt="VMCC"
            width={20}
            height={20}
            className="size-5 object-cover rounded-full shrink-0"
          />
          <div className="overflow-hidden text-white text-sm font-medium leading-[1.5] tracking-sm -mt-2">
            Atlantus Mining Works{" "}
            <span className="text-[#929292]">(MCL000213)</span>
          </div>
        </div>
      </div>

      <div className="w-full grid @sm:grid-cols-2 gap-y-4 gap-x-2 @md:gap-x-3.5">
        <Button variant="secondary" className="cursor-pointer">
          Back
        </Button>
        <Button className="cursor-pointer">Claim</Button>
      </div>
    </section>
  );
}
