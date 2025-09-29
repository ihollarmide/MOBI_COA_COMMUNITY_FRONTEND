import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AUTH_TOAST_ID } from "@/modules/auth/constants";
import { useOnboardingUrlStates } from "./useOnboardingUrlStates";
import { useVerifyTwitter } from "@/modules/onboarding/usecases/VerifyTwitter.usecase";

const TWITTER_ERROR_CODES: Record<string, string> = {
  access_denied: "User denied access to the application",
  invalid_request: "The request is missing a required parameter",
  invalid_client: "Client authentication failed",
  invalid_grant: "The provided authorization grant is invalid",
  invalid_scope: "The requested scope is invalid",
  invalid_state: "The state parameter is invalid",
  invalid_code: "The authorization code is invalid",
};

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
  const {
    mutate: verifyTwitter,
    isPending: isVerifyTwitterPending,
    isSuccess: isVerifyTwitterSuccess,
  } = useVerifyTwitter();
  const [{ x: xStep, step: pageStep }] = useOnboardingUrlStates();
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

        const response = await fetch("/api/social/twitter", {
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
      verifyTwitter(
        { username: data.user.username, twitterId: data.user.id },
        {
          onSuccess: () => {
            onSuccess?.(data);
          },
          onError: (error) => {
            onError?.(error);
          },
        }
      );
    },
    onError: (error: Error) => {
      console.error("OAuth callback error:", error);
      toast.error("Twitter authentication failed", {
        description: error.message,
        id: AUTH_TOAST_ID,
        duration: 10000,
      });
      onError?.(error);
    },
  });

  useEffect(() => {
    // Prevent multiple executions
    if (hasExecuted.current) return;
    if (pageStep !== "follow-us" || xStep !== "signin") return;

    if (error || errorDescription) {
      toast.error(`Twitter authentication failed!`, {
        description: errorDescription
          ? errorDescription
          : error
            ? TWITTER_ERROR_CODES[error]
            : "Unknown error",
        id: AUTH_TOAST_ID,
      });
      const url = new URL(window.location.href);
      ["code", "state", "error", "error_description"].forEach((p) =>
        url.searchParams.delete(p)
      );
      window.history.replaceState({}, "", url.toString());
      hasExecuted.current = true;
      return;
    }

    if (state && code && !isPending) {
      // ✅ Lock immediately before firing mutation
      hasExecuted.current = true;
      completeTwitterOAuth({ code, state });
    }
  }, [
    state,
    code,
    error,
    errorDescription,
    isPending,
    completeTwitterOAuth,
    pageStep,
    xStep,
  ]);

  // Reset mutation when URL parameters change or component unmounts
  useEffect(() => {
    return () => {
      if (isPending) {
        reset();
      }
    };
  }, [code, state, reset, isPending]);

  return {
    isCompletingTwitterOAuth: isPending || isVerifyTwitterPending,
    isCompleteTwitterOAuthSuccess:
      isCompleteTwitterOAuthSuccess && isVerifyTwitterSuccess,
    resetTwitterOAuth: reset,
  };
}
