"use client";

import { useState, useCallback } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Telegram Widget API types
interface TelegramWidget {
  Login: {
    auth: (
      options: TelegramAuthOptions,
      callback: (response: TelegramResponseData | false | null) => void
    ) => void;
  };
}

interface TelegramAuthOptions {
  bot_id: string;
  request_access: boolean;
}

interface TelegramResponseData {
  auth_date: number;
  first_name: string;
  hash: string;
  id: number;
  last_name: string;
  photo_url: string;
  username: string;
}

interface TelegramAuthResponse {
  auth_date: number;
  first_name: string;
  id: number;
  last_name: string;
  photo_url: string;
  username: string;
}

interface TelegramButtonProps {
  onClick?: () => void;
  onSuccess?: (data: TelegramAuthResponse) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    Telegram?: TelegramWidget;
  }
}

const TOAST_ID = "telegram-button";
const TELEGRAM_SCRIPT_URL = "https://telegram.org/js/telegram-widget.js?2";

export function TelegramButton({
  onClick,
  onSuccess,
  onError,
  disabled = false,
  className = "cursor-pointer",
}: TelegramButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleApiResponse = useCallback(
    async (response: TelegramResponseData) => {
      try {
        const apiResponse = await fetch("/api/telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(response),
        });

        if (!apiResponse.ok) {
          throw new Error(
            `API response failed with status: ${apiResponse.status}`
          );
        }

        const data: TelegramAuthResponse = await apiResponse.json();
        showSuccess("Telegram authorization successful.");
        onSuccess?.(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showError(`Telegram authorization failed: ${errorMessage}`);
      }
    },
    [onSuccess, showError, showSuccess]
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

        handleApiResponse(response);
      }
    );
  }, [BOT_ID, onClick, showError, validateTelegramResponse, handleApiResponse]);

  const handleScriptLoad = useCallback(() => {
    setIsScriptLoaded(true);
  }, []);

  const isButtonDisabled = disabled || !isScriptLoaded || isLoading;
  const buttonText = isLoading
    ? "Authenticating..."
    : !isScriptLoaded
      ? "Loading Telegram..."
      : "Sign in with Telegram";

  return (
    <>
      <Script
        src={TELEGRAM_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
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
