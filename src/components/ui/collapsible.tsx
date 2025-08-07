import clsx from "clsx";
import { ReactNode } from "react";

interface CollapsibleProps {
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  direction?: "vertical" | "horizontal";
  durationInMs?: number;
}

export function Collapsible({
  children,
  className,
  isOpen,
  direction = "vertical",
  durationInMs = 500,
}: CollapsibleProps) {
  const isVertical = direction === "vertical";

  return (
    <div
      style={{
        transitionDuration: `${durationInMs}ms`,
      }}
      className={clsx(
        "grid ease-linear",
        {
          // Vertical animation classes
          "transition-[grid-template-rows]": isVertical,
          "grid-rows-[0fr]": isVertical && !isOpen,
          "grid-rows-[1fr]": isVertical && isOpen,

          // Horizontal animation classes
          "transition-[grid-template-columns]": !isVertical,
          "grid-cols-[0fr]": !isVertical && !isOpen,
          "grid-cols-[1fr]": !isVertical && isOpen,

          "pointer-events-none": !isOpen,
          "pointer-events-auto": isOpen,
        },
        className
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
