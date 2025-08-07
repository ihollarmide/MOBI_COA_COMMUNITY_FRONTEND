import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { VMCC_DAO_LINK } from "@/common/constants";
import { IconsNames } from "@/components/icons/icon.types";
import { IconSlate } from "./icon-slate";

export const JOIN_VMCC_DAO_ACTION_LIST = [
  {
    icon: IconsNames.DIRECTIONS,
    description: "Get directions to start your VMCC.",
  },
  {
    icon: IconsNames.PASSCODE,
    description: "Access ecosystem updates.",
  },
  {
    icon: IconsNames.TELECAST,
    description: "Join community Telecasts.",
  },
  {
    icon: IconsNames.TELEGRAM,
    description: "Interact with other VMCC Builders.",
  },
];

export function JoinVMCCDao() {
  return (
    <section className="w-full space-y-11 @container">
      <div className="space-y-2 text-center">
        <SectionTitle>Congratulations!</SectionTitle>
        <p className="text-sm leading-[1.4] tracking-sm text-gray-100">
          You’ve successfully claimed your Yard Genesis Key! <br />
          Click the button below to join the VMCC Builder DAO where you:
        </p>
      </div>

      <div className="grid grid-cols-1 @xs:grid-cols-2 @lg:grid-cols-4 gap-5">
        {JOIN_VMCC_DAO_ACTION_LIST.map((item) => (
          <div
            key={item.description}
            className="gap-y-3 flex flex-col items-center justify-center text-center"
          >
            <IconSlate
              icon={item.icon}
              variant="default"
              as="div"
              className="w-[55px] h-[55px]"
              iconClassName="size-[25px]"
            />
            <p className="text-xs leading-[1.4] tracking-xxs text-white">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <Button asChild={true} className="cursor-pointer w-full">
        <a href={VMCC_DAO_LINK} target="_blank" rel="noopener noreferrer">
          Join VMCC Builder DAO
        </a>
      </Button>
    </section>
  );
}
