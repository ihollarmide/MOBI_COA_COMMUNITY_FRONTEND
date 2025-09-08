import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AUTH_TOAST_ID } from "@/modules/auth/constants";

interface TwitterOAuthData {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
}

export function useCompleteTwitterOAuth({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TwitterOAuthData) => void;
  onError?: (error: Error) => void;
}) {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Prevent multiple executions
  const hasExecuted = useRef(false);

  const {
    mutate: completeTwitterOAuth,
    isPending,
    isSuccess: isCompleteTwitterOAuthSuccess,
    reset,
  } = useMutation({
    mutationFn: async (params: {
      code: string;
      state: string;
    }): Promise<TwitterOAuthData> => {
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch("/api/auth/twitter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to exchange code for token"
          );
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "OAuth failed");
        }

        return data as TwitterOAuthData;
      } catch (error) {
        console.error("Twitter OAuth mutation error:", error);
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Request timeout - please try again");
        }
        throw error;
      }
    },
    onMutate: () => {
      toast.loading("Completing Twitter OAuth", {
        description: "",
        id: AUTH_TOAST_ID,
      });
    },
    onSuccess: (data) => {
      toast.success("Successfully connected with X!", {
        id: AUTH_TOAST_ID,
      });

      // Clean up URL parameters
      const url = new URL(window.location.href);
      ["code", "state", "error", "error_description"].forEach((p) =>
        url.searchParams.delete(p)
      );
      window.history.replaceState({}, "", url.toString());
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error("OAuth callback error:", error);
      toast.error("Twitter authentication failed", {
        description: error.message,
        id: AUTH_TOAST_ID,
      });
      onError?.(error);
    },
  });

  useEffect(() => {
    // Prevent multiple executions
    if (hasExecuted.current) return;

    if (error || errorDescription) {
      toast.error(
        `Twitter authentication failed: ${errorDescription ?? error}`,
        {
          id: AUTH_TOAST_ID,
        }
      );
      hasExecuted.current = true;
      return;
    }

    if (state && code && !isPending) {
      // ✅ Lock immediately before firing mutation
      hasExecuted.current = true;
      completeTwitterOAuth({ code, state });
    }
  }, [state, code, error, errorDescription, isPending, completeTwitterOAuth]);

  // Reset mutation when URL parameters change or component unmounts
  useEffect(() => {
    return () => {
      if (isPending) {
        reset();
      }
    };
  }, [code, state, reset, isPending]);

  return {
    isCompletingTwitterOAuth: isPending,
    isCompleteTwitterOAuthSuccess,
    resetTwitterOAuth: reset,
  };
}
