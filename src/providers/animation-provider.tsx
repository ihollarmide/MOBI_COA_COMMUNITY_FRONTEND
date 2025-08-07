"use client";

import React, { useEffect, useState } from "react";
import { LazyMotion } from "motion/react";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState<boolean>(false);
  const features = () =>
    import("../lib/animation.utils").then((res) => res.default);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <LazyMotion features={features} strict>
      {children}
    </LazyMotion>
  );
}
