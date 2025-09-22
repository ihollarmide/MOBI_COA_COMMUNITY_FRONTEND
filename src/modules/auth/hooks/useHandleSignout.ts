"use client";

import { useDisconnect } from "wagmi";
import { useSessionStorage } from "@/modules/auth/hooks/useSessionStorage";
import { toast } from "sonner";

export function useHandleSignout() {
  const { signOut } = useSessionStorage();

  return {
    handleSignout: () => signOut(),
  };
}
