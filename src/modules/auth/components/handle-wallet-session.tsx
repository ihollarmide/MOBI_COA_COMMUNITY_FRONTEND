"use client";

import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useSession } from "@/modules/auth/hooks/useSession";
import { useEffect } from "react";
import { useHandleSignout } from "@/modules/auth/hooks/useHandleSignout";
import { usePathname, useRouter } from "next/navigation";

export function HandleWalletSession() {
  const router = useRouter();
  const pathname = usePathname();
  router.prefetch("/welcome");
  // router.prefetch(URL_PATHS.signin.path);

  const { status, address } = useWalletConnectionStatus();
  const { session, status: sessionStatus } = useSession();

  const { handleSignout } = useHandleSignout();

  const isAuthenticatedSessionAddressMismatch =
    !!address && sessionStatus === "authenticated" && !!session?.walletAddress
      ? session?.walletAddress?.toLowerCase() !== address.toLowerCase()
      : false;

  useEffect(() => {
    if (status === "disconnected" && sessionStatus === "authenticated") {
      handleSignout();
    }
  }, [pathname, status, sessionStatus, handleSignout]);

  useEffect(() => {
    if (isAuthenticatedSessionAddressMismatch) {
      handleSignout();
    }
  }, [isAuthenticatedSessionAddressMismatch, session, address, handleSignout]);

  return null;
}
