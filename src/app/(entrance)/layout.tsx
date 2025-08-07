import React from "react";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full w-full">
      <video
        src="https://res.cloudinary.com/djhkn5moz/video/upload/v1752218990/vecteezy_underwater-ocean-waves-ripples-flowing-with-the-light_48233203_nfesix.mov"
        className="absolute inset-0 object-cover w-full h-full pointer-events-none -z-[3]"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute w-full h-full inset-0 bg-[#010812]/[0.77] -z-[2] pointer-events-none" />
      <div className="absolute w-full h-full inset-0 bg-front-layout -z-[1] pointer-events-none backdrop-blur-[2px]" />

      <div className="w-full h-full overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-10">
            <div className="max-w-[1216px] min-h-[calc(100vh-80px)] h-full w-full mx-auto flex flex-col">
              <main className="w-full flex-1 flex flex-col items-center justify-center gap-y-[30px] max-w-[665px] py-5 mx-auto">
                <Image
                  src="/images/vmcc-logo.png"
                  alt="VMCC"
                  width={136}
                  height={48}
                  className="max-w-[134px] w-full h-auto aspect-[133/47] mx-auto"
                />
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
