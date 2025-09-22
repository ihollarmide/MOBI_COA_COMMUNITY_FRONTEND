"use client";

import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useSessionStorage } from "@/modules/auth/hooks/useSessionStorage";
import { useEffect, useState } from "react";
import { useHandleSignout } from "@/modules/auth/hooks/useHandleSignout";
import { usePathname, useRouter } from "next/navigation";

const unauthOnlyRoutes = ["/welcome"];

export function HandleWalletSession() {
  const [isSignedout, setIsSignedout] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  // console.log("pathname: ", pathname)
  router.prefetch("/welcome");
  router.prefetch("/onboarding");
  // router.prefetch(URL_PATHS.signin.path);

  const {
    status: walletStatus,
    address: walletAddress,
    isLoading: isWalletLoading,
  } = useWalletConnectionStatus();
  const { session, status: sessionStatus } = useSessionStorage();

  const { handleSignout } = useHandleSignout();

  const isAuthenticatedSessionAddressMismatch =
    !!walletAddress &&
    sessionStatus === "authenticated" &&
    !!session?.walletAddress
      ? session?.walletAddress?.toLowerCase() !== walletAddress.toLowerCase()
      : false;

  useEffect(() => {
    if (
      walletStatus === "disconnected" &&
      sessionStatus === "unauthenticated" &&
      pathname.startsWith("/onboarding") &&
      !isSignedout
    ) {
      setIsSignedout(true);
      handleSignout();
    }
  }, [walletStatus, handleSignout, sessionStatus, pathname, isSignedout]);

  useEffect(() => {
    if (isSignedout) {
      return;
    }

    if (
      sessionStatus === "loading" ||
      sessionStatus === "unauthenticated" ||
      isWalletLoading
    )
      return;

    if (
      pathname.startsWith("/onboarding") &&
      walletStatus === "disconnected" &&
      sessionStatus === "authenticated"
    ) {
      setIsSignedout(true);
      handleSignout();
    }
  }, [
    pathname,
    walletStatus,
    sessionStatus,
    handleSignout,
    isWalletLoading,
    isSignedout,
  ]);

  useEffect(() => {
    if (isAuthenticatedSessionAddressMismatch && !isSignedout) {
      setIsSignedout(true);
      handleSignout();
    }
  }, [isAuthenticatedSessionAddressMismatch, handleSignout, isSignedout]);

  useEffect(() => {
    if (
      unauthOnlyRoutes.some((r) => pathname.startsWith(r)) &&
      walletStatus !== "disconnected"
    ) {
      if (
        sessionStatus === "loading" ||
        sessionStatus === "unauthenticated" ||
        isWalletLoading
      )
        return;

      return router.push("/onboarding");
    }
  }, [sessionStatus, router, pathname, isWalletLoading, walletStatus]);

  useEffect(() => {
    if (pathname.startsWith("/onboarding") && walletStatus !== "disconnected") {
      if (
        sessionStatus === "loading" ||
        sessionStatus === "authenticated" ||
        isWalletLoading
      ) {
        return;
      }
      return router.push("/welcome");
    }
  }, [sessionStatus, router, pathname, isWalletLoading, walletStatus]);

  return null;
}
