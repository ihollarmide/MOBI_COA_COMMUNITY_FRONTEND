import { cn } from "@/lib/utils";

export function ButtonsFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 @[250px]:grid-cols-2 gap-y-4 gap-x-2 @md:gap-x-3.5",
        className
      )}
    >
      {children}
    </div>
  );
}
