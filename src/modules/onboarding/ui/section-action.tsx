import { GlassCard } from "@/components/ui/glass-card";
import { Collapsible } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { IconSlate } from "./icon-slate";
import clsx from "clsx";
import { Icon } from "@/components/icons/icon";
import { IconsNames } from "@/components/icons/icon.types";

export function SectionAction({
  title,
  description,
  icon,
  isSuccess,
  isCollapsibleOpen,
  isError,
  errorMessage,
  inputPlaceholder,
  onInputChange,
  inputValue,
}: {
  title: string;
  description: string;
  icon: IconsNames;
  isSuccess: boolean;
  isCollapsibleOpen: boolean;
  isError: boolean;
  errorMessage: string | null;
  inputPlaceholder: string;
  onInputChange: (value: string) => void;
  inputValue: string;
}) {
  return (
    <GlassCard
      className={clsx("px-3.5 py-4.5 rounded-lg w-full", {
        "bg-green-tint": isSuccess,
      })}
    >
      <div className="flex items-center justify-start gap-x-2">
        <IconSlate variant="default" icon={icon} as="div" />
        <div className="space-y-1 flex-1 overflow-ellipsis">
          <p className="text-base font-medium leading-[1.5] tracking-mxs text-white">
            {title}
          </p>
          <p className="text-sm font-normal leading-[1.5] tracking-xxs text-[#aaa]">
            {description}
          </p>
        </div>
        {isSuccess ? (
          <Icon
            name={IconsNames.SUCCESS}
            width={24}
            height={24}
            className="size-6"
          />
        ) : null}
      </div>

      <Collapsible isOpen={isCollapsibleOpen}>
        <div className="pt-4">
          <Input
            aria-invalid={isError}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={inputPlaceholder}
          />
          {isError && errorMessage && (
            <p className="text-destructive text-sm font-normal leading-[1.5] tracking-xxs">
              {errorMessage}
            </p>
          )}
        </div>
      </Collapsible>
    </GlassCard>
  );
}
