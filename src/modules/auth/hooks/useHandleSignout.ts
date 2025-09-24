"use client";

import { signOut } from "next-auth/react";
import { useDisconnect } from "wagmi";

export function useHandleSignout() {
  const { disconnectAsync } = useDisconnect({
    mutation: {
      onSettled: () => {
        signOut({
          redirectTo: `/welcome`,
        });
      },
    },
  });
  return {
    handleSignout: () => {
      disconnectAsync();
    },
  };
}
