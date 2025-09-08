"use client";

import { useCallback, useRef } from "react";
import type { SessionData } from "@/modules/auth/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDisconnect } from "wagmi";

type Status = "loading" | "authenticated" | "unauthenticated";

const fetchSession = async (): Promise<SessionData | null> => {
  const res = await fetch("/api/auth/session");
  if (!res.ok) {
    throw new Error(`Failed to fetch session: ${res.status}`);
  }
  return res.json();
};

const updateSession = async (
  data: Partial<SessionData>
): Promise<SessionData | null> => {
  const res = await fetch("/api/auth/session", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update session: ${res.status}`);
  }
  return res.json();
};

const signOut = async (): Promise<void> => {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) {
    throw new Error(`Failed to sign out: ${res.status}`);
  }
  return res.json() as Promise<void>;
};

export function useSession() {
  const queryClient = useQueryClient();
  const { disconnect } = useDisconnect();

  // Use refs to prevent stale closures and race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUpdatingRef = useRef(false);

  const {
    data: sessionData = null,
    isPending: isLoadingSession,
    error: sessionError,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ["fetch-session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Memoized status calculation to prevent unnecessary re-renders
  const status: Status = isLoadingSession
    ? "loading"
    : sessionData
      ? "authenticated"
      : "unauthenticated";

  const updateMutation = useMutation({
    mutationFn: updateSession,
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this update
      abortControllerRef.current = new AbortController();
      isUpdatingRef.current = true;

      // Optimistically update the cache
      const previousSession = queryClient.getQueryData(["fetch-session"]);
      queryClient.setQueryData(["fetch-session"], (old: SessionData | null) =>
        old ? { ...old, ...newData } : null
      );

      return { previousSession };
    },
    onError: (err, newData, context) => {
      // Revert optimistic update on error
      if (context?.previousSession !== undefined) {
        queryClient.setQueryData(["fetch-session"], context.previousSession);
      }
      console.error("Failed to update session:", err);
    },
    onSettled: () => {
      isUpdatingRef.current = false;
      abortControllerRef.current = null;
    },
  });

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onMutate: async () => {
      // Cancel any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Optimistically clear session
      queryClient.setQueryData(["fetch-session"], null);
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
      return updateMutation.mutateAsync(data);
    },
    [updateMutation]
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

export function useSessionMutation() {
  return useMutation({
    mutationFn: fetchSession,
  });
}
