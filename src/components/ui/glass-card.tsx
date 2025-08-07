import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    // <div
    //   className={cn(
    //     "border-white/[0.05] border-[0.5px] border-solid relative p-px rounded-[15px] overflow-hidden bg-[#0A181C1F] z-[0]",
    //     className
    //   )}
    // >
    //   <div className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1] flex items-center justify-center overflow-hidden">
    //     <Icon
    //       name={IconsNames.GLASS_1}
    //       width={2048}
    //       height={1202}
    //       className="w-[6000px] h-[4000px] fill-white/[0.01] backdrop-blur-[6.9px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    //     />
    //   </div>

    //   <div className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2] flex items-center justify-center overflow-hidden">
    //     <Icon
    //       name={IconsNames.GLASS_2}
    //       width={2038}
    //       height={1192}
    //       className="w-[6000px] h-[4000px] fill-white/[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    //     />
    //   </div>

    //   <section
    //     className={cn(
    //       "z-[3] relative overflow-hidden rounded-[20px]",
    //       className
    //     )}
    //   >
    //     {children}
    //   </section>
    // </div>
    <article
      className={cn(
        "border-border/[0.05] border-[0.5px] border-solid relative rounded-[15px] overflow-hidden bg-glass-gradient",
        className
      )}
    >
      {children}
    </article>
  );
}
