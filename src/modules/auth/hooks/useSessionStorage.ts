"use client";

import { useCallback, useRef } from "react";
import type { SessionData } from "@/modules/auth/types";
import {
  QueryKey,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useChainId, useDisconnect } from "wagmi";
import {
  destroySessionInStorage,
  getSessionFromStorage,
  updateSessionInStorage as updateSessionInStorageClient,
} from "@/modules/auth/lib/session.client";
import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useSecretContext } from "@/modules/auth/context";

type Status = "loading" | "authenticated" | "unauthenticated";

const fetchSessionFromStorage = async ({
  sessionSecret,
}: {
  walletAddress?: string | null;
  chainId: number;
  sessionSecret?: string | null;
}): Promise<SessionData | null> => {
  if (!sessionSecret) {
    return null;
  }

  try {
    const res = await getSessionFromStorage({ sessionSecret });
    return res;
  } catch (error) {
    console.error("fetchSessionFromStorage error:", error);
    return null;
  }
};

const updateSessionInStorage = async ({
  data,
  sessionSecret,
}: {
  data: Partial<SessionData>;
  sessionSecret?: string | null;
}): Promise<SessionData | null> => {
  if (!sessionSecret) return null;

  try {
    const updatedSession = await updateSessionInStorageClient({
      partial: data,
      sessionSecret,
    });
    return updatedSession;
  } catch (error) {
    console.error("Failed to update session in storage:", error);
    return null;
  }
};

const getQueryKey = (
  walletAddress: string | null | undefined,
  chainId: number | null | undefined,
  sessionSecret: string | null | undefined
): QueryKey => {
  return ["fetch-session", walletAddress, chainId, sessionSecret];
};

const signOutFromStorage = async (): Promise<void> => {
  const res = await destroySessionInStorage();
  return res;
};

export function useSessionStorage() {
  const { address: walletAddress } = useWalletConnectionStatus();
  const { secretKey: sessionSecret } = useSecretContext();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { disconnect } = useDisconnect();

  // Use refs to prevent stale closures and race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUpdatingRef = useRef(false);

  // const queryEnabled = !!(walletAddress && sessionSecret && chainId);

  const {
    data: sessionData = null,
    isPending: isLoadingSession,
    error: sessionError,
    refetch: refetchSession,
  } = useQuery({
    queryKey: getQueryKey(walletAddress, chainId, sessionSecret),
    queryFn:
      !!walletAddress && !!sessionSecret && !!chainId
        ? () =>
            fetchSessionFromStorage({ walletAddress, chainId, sessionSecret })
        : skipToken,
    // initialData: null,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: true, // Override global setting
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Manual trigger for testing
  // useEffect(() => {
  //   if (queryEnabled && !isLoadingSession && !sessionData) {
  //     refetchSession();
  //   }
  // }, [queryEnabled, isLoadingSession, sessionData]);

  // Memoized status calculation to prevent unnecessary re-renders
  const status: Status =
    !walletAddress || !sessionSecret || !chainId
      ? "unauthenticated"
      : sessionData
        ? "authenticated"
        : isLoadingSession
          ? "loading"
          : "unauthenticated";

  const queryKey = getQueryKey(walletAddress, chainId, sessionSecret);

  const updateMutation = useMutation({
    mutationFn: updateSessionInStorage,
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this update
      abortControllerRef.current = new AbortController();
      isUpdatingRef.current = true;

      // Optimistically update the cache
      const previousSession = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: SessionData | null) =>
        old ? { ...old, ...newData } : null
      );

      return { previousSession };
    },
    onError: (err, newData, context) => {
      // Revert optimistic update on error
      if (context?.previousSession !== undefined) {
        queryClient.setQueryData(queryKey, context.previousSession);
      }
      console.error("Failed to update session:", err);
    },
    onSettled: () => {
      isUpdatingRef.current = false;
      abortControllerRef.current = null;
    },
  });

  const signOutMutation = useMutation({
    mutationFn: signOutFromStorage,
    onMutate: async () => {
      // Cancel any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Optimistically clear session
      queryClient.setQueryData(queryKey, null);
    },
    onSuccess: async () => {
      try {
        // Clear all queries and cache

        // Disconnect wallet
        disconnect();

        // Navigate to welcome
        window.location.href = "/welcome";
        await queryClient.resetQueries();
        queryClient.clear();
      } catch (error) {
        console.error("Error during sign out cleanup:", error);
      }
    },
    onError: (error) => {
      console.error("Sign out failed:", error);
      // Revert optimistic update on error
      refetchSession();
    },
  });

  // Memoized refresh function to prevent unnecessary re-renders
  const refresh = useCallback(async () => {
    if (!isUpdatingRef.current) {
      return refetchSession();
    }
  }, [refetchSession]);

  // Memoized update function
  const update = useCallback(
    async (data: Partial<SessionData>) => {
      if (isUpdatingRef.current) {
        throw new Error("Update already in progress");
      }

      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      return updateMutation.mutateAsync({ data, sessionSecret });
    },
    [updateMutation, sessionSecret, walletAddress]
  );

  return {
    session: sessionData,
    status,
    isLoading: status === "loading",
    error: sessionError,
    update,
    updateMutation,
    signOut: signOutMutation.mutateAsync,
    refresh,
    isUpdating: isUpdatingRef.current,
  };
}

export function useSessionClientMutation() {
  const queryClient = useQueryClient();
  const { secretKey: sessionSecret } = useSecretContext();
  const { address: walletAddress } = useWalletConnectionStatus();
  const chainId = useChainId();
  const queryKey = getQueryKey(walletAddress, chainId, sessionSecret);
  return useMutation({
    mutationFn: ({
      address,
    }: {
      address?: string | null;
    } = {}) =>
      fetchSessionFromStorage({
        walletAddress: address ?? walletAddress,
        chainId,
        sessionSecret,
      }),
    onSuccess: (data) => {
      console.log("data in mutation: ", data);
      queryClient.setQueryData(queryKey, data);
    },
    onError: (error) => {
      console.error("Error fetching session:", error);
      return null;
    },
  });
}
