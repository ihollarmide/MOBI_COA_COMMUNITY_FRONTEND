"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  TelegramAuthApiResponse,
  TelegramAuthResponse,
  TelegramResponseData,
  TelegramWidget,
} from "@/types";
import { post } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

// Extend the global Window interface
declare global {
  interface Window {
    Telegram?: TelegramWidget;
  }
}

const TOAST_ID = "telegram-button";
const TELEGRAM_SCRIPT_ID = "telegram-login-script";
const TELEGRAM_SCRIPT_URL = "https://telegram.org/js/telegram-widget.js?22";

export const processTelegramAuth = async (payload: TelegramResponseData) => {
  try {
    const data = await post<TelegramAuthApiResponse, TelegramResponseData>({
      url: "/api/social/telegram",
      isProtected: false,
      config: {
        headers: {
          "Content-Type": "application/json",
        },
        baseURL: process.env.NEXT_PUBLIC_APP_URL,
      },
      payload: payload,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Process Telegram auth error:`, error);
    const message =
      error instanceof Error ? error.message : `Process Telegram auth failed`;
    throw new Error(message);
  }
};

interface TelegramButtonProps {
  onClick?: () => void;
  onSuccess?: (data: TelegramAuthResponse) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TelegramButton({
  onClick,
  onSuccess,
  onError,
  disabled = false,
  className = "cursor-pointer",
}: TelegramButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: processTelegramAuthAsync } = useMutation({
    mutationFn: processTelegramAuth,
    onMutate: () => {
      setIsLoading(true);
      toast.loading("Getting your Telegram account...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data) => {
      onSuccess?.(data.user);
      toast.success("Telegram authorization successful.", { id: TOAST_ID });
    },
    onError: (error) => {
      // The showError callback handles the UI update
      onError?.(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const BOT_ID = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;

  const showError = useCallback(
    (message: string) => {
      toast.error(message, { id: TOAST_ID });
      onError?.(message);
    },
    [onError]
  );

  const validateTelegramResponse = useCallback(
    (
      response: TelegramResponseData | false | null
    ): response is TelegramResponseData => {
      if (!response) return false;
      return !!(
        response.id &&
        response.first_name &&
        response.hash &&
        response.auth_date
      );
    },
    []
  );

  // --- START: Comprehensive Script Loading Logic ---
  useEffect(() => {
    // If script is already loaded (e.g., from cache or another instance), we're good to go.
    if (window.Telegram) {
      setIsScriptLoaded(true);
      return;
    }

    // // Get nonce from meta tag for CSP compliance
    // const nonce = document
    //   .querySelector('meta[name="nonce"]')
    //   ?.getAttribute("content");

    const script = document.createElement("script");
    script.id = TELEGRAM_SCRIPT_ID;
    script.src = TELEGRAM_SCRIPT_URL;
    script.async = true;

    // Add nonce to script for CSP compliance
    // if (nonce) {
    //   script.setAttribute("nonce", nonce);
    // }

    const handleLoad = () => {
      console.log("Telegram script loaded successfully.");
      setIsScriptLoaded(true);
    };

    const handleError = (event: Event | string) => {
      console.error("Failed to load Telegram script:", event);
      showError("Failed to load Telegram script. Please try again.");
      // Clean up the failed script tag
      document.getElementById(TELEGRAM_SCRIPT_ID)?.remove();
    };

    script.onload = handleLoad;
    script.onerror = handleError;

    // Append the script to the body to start loading.
    // We check if it's already there to avoid duplicates in case of fast re-renders.
    if (!document.getElementById(TELEGRAM_SCRIPT_ID)) {
      document.body.appendChild(script);
    }

    // Cleanup function to remove event listeners when the component unmounts.
    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [showError]);
  // --- END: Comprehensive Script Loading Logic ---

  const handleSignInWithTelegram = useCallback(() => {
    if (!BOT_ID) {
      showError("Telegram bot ID is not configured.");
      return;
    }

    if (!window.Telegram?.Login?.auth) {
      showError("Telegram script not ready or auth function not found.");
      return;
    }

    onClick?.();

    window.Telegram.Login.auth(
      { bot_id: BOT_ID, request_access: true },
      (response: TelegramResponseData | false | null) => {
        if (!validateTelegramResponse(response)) {
          showError("Telegram authorization failed or was cancelled.");
          setIsLoading(false); // Manually reset loading state on cancellation
          return;
        }

        processTelegramAuthAsync(response);
      }
    );
  }, [
    BOT_ID,
    onClick,
    showError,
    validateTelegramResponse,
    processTelegramAuthAsync,
  ]);

  const isButtonDisabled = disabled || !isScriptLoaded || isLoading;
  const buttonText = isLoading
    ? "Authenticating..."
    : isScriptLoaded
      ? "Sign in with Telegram"
      : "Loading Telegram...";

  return (
    <Button
      onClick={handleSignInWithTelegram}
      className={className}
      disabled={isButtonDisabled}
      type="button"
    >
      {buttonText}
    </Button>
  );
}
