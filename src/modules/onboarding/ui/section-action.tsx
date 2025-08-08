import { GlassCard } from "@/components/ui/glass-card";
import { Collapsible } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { IconSlate } from "./icon-slate";
import clsx from "clsx";
import { Icon } from "@/components/icons/icon";
import { IconsNames } from "@/components/icons/icon.types";
import { ReactNode } from "react";
import { Loader } from "@/components/ui/loader";

export function SectionAction({
  title,
  description,
  icon,
  isSuccess,
  isCollapsibleOpen,
  isError,
  errorMessage,
  inputPlaceholder,
  isInputLoading,
  onInputChange,
  inputValue,
  collapsibleContent,
}: {
  title: string;
  description: string;
  icon: IconsNames;
  isSuccess: boolean;
  isCollapsibleOpen: boolean;
  isError: boolean;
  errorMessage: string | null;
  isInputLoading?: boolean;
  inputPlaceholder: string;
  onInputChange: (value: string) => void;
  inputValue: string;
  collapsibleContent?: ReactNode;
}) {
  return (
    <GlassCard
      className={clsx("px-3.5 py-4.5 rounded-lg w-full font-sans", {
        "bg-green-tint": isSuccess,
      })}
    >
      <div className="flex items-start justify-start gap-x-2">
        <IconSlate variant="default" icon={icon} as="div" />
        <div className="space-y-1 flex-1 overflow-ellipsis">
          <p className="text-base font-medium leading-[1.5] tracking-mxs text-white whitespace-normal">
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
            className="size-6 hidden @[300px]:block"
          />
        ) : null}
      </div>

      <Collapsible isOpen={isCollapsibleOpen}>
        <div className="pt-4">
          {collapsibleContent ? (
            collapsibleContent
          ) : (
            <>
              <Input
                aria-invalid={isError}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                disabled={isInputLoading}
                endContent={isInputLoading ? <Loader loaderSize={16} /> : null}
              />
              {isError && errorMessage && (
                <p className="text-destructive mt-1 text-xs font-normal leading-[1.5] tracking-xxs line-clamp-1">
                  {errorMessage}
                </p>
              )}
            </>
          )}
        </div>
      </Collapsible>
    </GlassCard>
  );
}
