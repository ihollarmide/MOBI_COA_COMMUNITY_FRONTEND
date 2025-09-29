"use client";

import { signOut } from "next-auth/react";
import { useDisconnect } from "@reown/appkit/react";

export function useHandleSignout() {
  const { disconnect } = useDisconnect();

  const handleSignout = async () => {
    await disconnect();
    signOut({
      redirectTo: `/welcome`,
    });
  };

  return {
    handleSignout,
  };
}
