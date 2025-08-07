import { cn } from "@/lib/utils";

export function SectionTitle({
  children,
  as = "h2",
  className,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}) {
  const Comp = as;

  return (
    <Comp
      className={cn("title-text-gradient text-2xl font-extrabold", className)}
    >
      {children}
    </Comp>
  );
}
