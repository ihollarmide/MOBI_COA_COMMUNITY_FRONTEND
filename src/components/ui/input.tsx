import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  startContent,
  endContent,
  startContentClassName,
  endContentClassName,
  ...props
}: React.ComponentProps<"input"> & {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  startContentClassName?: string;
  endContentClassName?: string;
}) {
  return (
    <div className="w-full relative">
      {startContent && (
        <div
          className={cn(
            "absolute left-2 top-1/2 transform -translate-y-1/2",
            startContentClassName
          )}
        >
          {startContent}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-white/70 selection:bg-primary selection:text-primary-foreground border-border/[0.05] flex h-10 w-full min-w-0 rounded-[10px] border bg-glass-gradient tracking-sm leading-[1.5] px-5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
          {
            "pl-9": startContent,
            "pr-9": endContent,
          }
        )}
        {...props}
      />
      {endContent && (
        <div
          className={cn(
            "absolute right-2 top-1/2 transform -translate-y-1/2",
            endContentClassName
          )}
        >
          {endContent}
        </div>
      )}
    </div>
  );
}

export { Input };
