import { GIFS } from "@/common/constants";
import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import clsx from "clsx";

type GenesisKeyGifProps = {
  batch: number;
  type: "acre" | "plot" | "yard";
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  gifClassName?: string;
  onlyShowImage?: boolean;
};

export function GenesisKeyGif({
  batch,
  type,
  width = 142,
  height = 156,
  className,
  onlyShowImage = false,
  imageClassName,
  gifClassName,
}: GenesisKeyGifProps) {
  const [isGifFullyLoaded, setIsGifFullyLoaded] = useState(false);

  const isOmega = batch > 0;

  const chosenGif =
    type === "acre"
      ? isOmega
        ? GIFS.ACRE
        : GIFS.ALPHA_ACRE
      : type === "plot"
        ? isOmega
          ? GIFS.PLOT
          : GIFS.ALPHA_PLOT
        : isOmega
          ? GIFS.YARD
          : GIFS.ALPHA_YARD;
  const chosenImage =
    type === "acre"
      ? "/images/acre.png"
      : type === "plot"
        ? "/images/plot.png"
        : "/images/yard.png";

  const chosenAlt =
    type === "acre"
      ? "acre genesis key"
      : type === "plot"
        ? "plot genesis key"
        : "yard genesis key";

  const currentShowing = isGifFullyLoaded && !onlyShowImage ? "gif" : "image";

  return (
    <div className="grid-parent-stack !inline-grid">
      <AnimatePresence mode="sync" key={"gif-image"}>
        <m.div
          key={chosenGif}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentShowing === "gif" ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className={clsx("grid-child-stack flex items-center justify-center", {
            "pointer-events-none": currentShowing === "image",
            "pointer-events-auto": currentShowing === "gif",
          })}
        >
          <Image
            onLoad={() => setIsGifFullyLoaded(true)}
            onError={() => setIsGifFullyLoaded(false)}
            src={chosenGif}
            alt={chosenAlt}
            width={width}
            height={height}
            className={cn(className, gifClassName)}
            unoptimized
          />
        </m.div>

        <m.div
          key={chosenImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentShowing === "image" ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className={clsx("grid-child-stack flex items-center justify-center", {
            "pointer-events-none": currentShowing === "gif",
            "pointer-events-auto": currentShowing === "image",
          })}
        >
          <Image
            src={chosenImage}
            alt={chosenAlt}
            width={width}
            height={height}
            priority={true}
            quality={100}
            loading="eager"
            className={cn(className, imageClassName)}
          />
        </m.div>
      </AnimatePresence>
    </div>
  );
}
