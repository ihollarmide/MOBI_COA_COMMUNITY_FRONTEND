"use client";

import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useEffect, useState } from "react";
import { useHandleSignout } from "@/modules/auth/hooks/useHandleSignout";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function AuthListener() {
  const [isSignedout, setIsSignedout] = useState<boolean>(false);
  const router = useRouter();
  // console.log("pathname: ", pathname)
  router.prefetch("/welcome");
  router.prefetch("/onboarding");
  // router.prefetch(URL_PATHS.signin.path);

  const { address: walletAddress, status: walletStatus } =
    useWalletConnectionStatus();
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();

  const { handleSignout } = useHandleSignout();

  const isAuthenticatedSessionAddressMismatch =
    !!walletAddress &&
    sessionStatus === "authenticated" &&
    !!session?.user?.walletAddress
      ? session?.user?.walletAddress?.toLowerCase() !==
        walletAddress.toLowerCase()
      : false;

  // useEffect(() => {
  //   if (
  //     walletStatus === "disconnected" &&
  //     sessionStatus === "unauthenticated" &&
  //     pathname.startsWith("/onboarding") &&
  //     !isSignedout
  //   ) {
  //     setIsSignedout(true);
  //     handleSignout();
  //   }
  // }, [walletStatus, handleSignout, sessionStatus, pathname, isSignedout]);

  useEffect(() => {
    if (isSignedout) {
      return;
    }

    if (
      pathname.startsWith("/onboarding") &&
      walletStatus === "disconnected" &&
      sessionStatus === "authenticated"
    ) {
      setIsSignedout(true);
      handleSignout();
    }
  }, [pathname, walletStatus, sessionStatus, handleSignout, isSignedout]);

  useEffect(() => {
    if (isAuthenticatedSessionAddressMismatch) {
      handleSignout();
    }
  }, [isAuthenticatedSessionAddressMismatch, handleSignout, isSignedout]);

  // useEffect(() => {
  //   if (
  //     unauthOnlyRoutes.some((r) => pathname.startsWith(r)) &&
  //     walletStatus !== "disconnected"
  //   ) {
  //     if (
  //       sessionStatus === "loading" ||
  //       sessionStatus === "unauthenticated" ||
  //       isWalletLoading
  //     )
  //       return;

  //     return router.push("/onboarding");
  //   }
  // }, [sessionStatus, router, pathname, isWalletLoading, walletStatus]);

  // useEffect(() => {
  //   if (pathname.startsWith("/onboarding") && walletStatus !== "disconnected") {
  //     if (
  //       sessionStatus === "loading" ||
  //       sessionStatus === "authenticated" ||
  //       isWalletLoading
  //     ) {
  //       return;
  //     }
  //     return router.push("/welcome");
  //   }
  // }, [sessionStatus, router, pathname, isWalletLoading, walletStatus]);

  return null;
}
