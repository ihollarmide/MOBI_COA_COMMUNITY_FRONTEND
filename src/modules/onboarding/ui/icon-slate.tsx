import { Icon } from "@/components/icons/icon";
import { IconsNames } from "@/components/icons/icon.types";
import { cn } from "@/lib/utils";
import clsx from "clsx";

export function IconSlate({
  variant,
  icon,
  as = "div",
  onClick,
  isCompleted = false,
  isActive = false,
  className,
  iconClassName,
}: {
  icon: IconsNames;
  variant: "default" | "nav";
  as: "div" | "button";
  onClick?: () => void;
  isCompleted?: boolean;
  isActive?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const Comp = as;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Comp
      type={Comp === "button" ? "button" : undefined}
      onClick={handleClick}
      className={cn(
        "bg-glass-gradient shrink-0 inline-flex items-center justify-center rounded-[10px] border-[0.5px] border-white/[0.05] border-solid py-[11px] px-3 relative w-11 aspect-square",
        className
      )}
    >
      <Icon
        name={isCompleted ? IconsNames.CHECK : icon}
        width={20}
        height={20}
        className={cn(
          "size-5 z-[1] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square",
          iconClassName,
          {
            "text-primary": (isCompleted || isActive) && variant === "nav",
            "text-white": variant === "default" || (!isCompleted && !isActive),
          }
        )}
      />
      {variant === "nav" ? (
        <Icon
          name={isCompleted ? IconsNames.CHECK : icon}
          width={20}
          height={20}
          className={clsx(
            "size-5 text-primary z-[2] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[4.5px] transition-opacity duration-300 aspect-square",
            iconClassName,
            {
              "opacity-0 pointer-events-none": !(isCompleted || isActive),
              "opacity-100 pointer-events-auto": isCompleted || isActive,
            }
          )}
        />
      ) : null}
    </Comp>
  );
}
