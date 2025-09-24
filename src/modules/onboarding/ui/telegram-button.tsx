"use client";

import { useState, useCallback, useEffect } from "react";
import Script from "next/script";
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

declare global {
  interface Window {
    Telegram?: TelegramWidget;
  }
}

const TOAST_ID = "telegram-button";
const TELEGRAM_SCRIPT_URL = "https://telegram.org/js/telegram-widget.js?2";

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

// Telegram Widget API types
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
      toast.loading("Getting your Telegram account...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data) => {
      onSuccess?.(data.user);
      showSuccess("Telegram authorization successful.");
    },
    onError: (error) => {
      showError(`Telegram authorization failed: ${error.message}`);
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

  const showSuccess = useCallback((message: string) => {
    toast.success(message, { id: TOAST_ID });
  }, []);

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

  const handleSignInWithTelegram = useCallback(() => {
    if (!BOT_ID) {
      showError("Telegram bot ID is not configured.");
      return;
    }

    if (!window.Telegram?.Login?.auth) {
      showError("Telegram script not loaded or auth function not found.");
      return;
    }

    onClick?.();
    setIsLoading(true);

    window.Telegram.Login.auth(
      { bot_id: BOT_ID, request_access: true },
      (response: TelegramResponseData | false | null) => {
        setIsLoading(false);

        if (!validateTelegramResponse(response)) {
          showError("Telegram authorization failed or was cancelled.");
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

  const handleScriptLoad = useCallback(() => {
    setIsScriptLoaded(true);
  }, []);

  // --- START FIX ---
  // Add this useEffect to handle cached scripts
  useEffect(() => {
    if (window.Telegram) {
      handleScriptLoad();
    }
  }, [handleScriptLoad]);
  // --- END FIX ---

  const isButtonDisabled = disabled || !isScriptLoaded || isLoading;
  const buttonText = isLoading
    ? "Authenticating..."
    : isScriptLoaded
      ? "Sign in with Telegram"
      : "Loading Telegram...";

  return (
    <>
      <Script
        src={TELEGRAM_SCRIPT_URL}
        strategy="afterInteractive"
        onReady={handleScriptLoad}
        onError={() => {
          showError("Failed to load Telegram script. Please try again.");
        }}
      />
      <Button
        onClick={handleSignInWithTelegram}
        className={className}
        disabled={isButtonDisabled}
        type="button"
      >
        {buttonText}
      </Button>
    </>
  );
}
