"use client";

import { useDisconnect } from "wagmi";
import { useSession } from "@/modules/auth/hooks/useSession";
import { toast } from "sonner";

export function useHandleSignout() {
  const { signOut } = useSession();
  const { status } = useSession();
  const { disconnectAsync } = useDisconnect({
    mutation: {
      onSuccess: () => {
        if (status !== "unauthenticated") {
          signOut();
        } else {
          window.location.href = "/welcome";
        }
      },
      onError: (error) => {
        console.error("Signout error:", error);
        toast.error("Failed to sign out properly");
      },
    },
  });

  const handleSignout = async () => {
    if (status !== "unauthenticated") {
      await disconnectAsync();
    } else {
      window.location.href = "/welcome";
    }
  };

  return {
    handleSignout,
  };
}
