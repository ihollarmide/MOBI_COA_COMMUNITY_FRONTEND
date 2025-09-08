"use client";

import { useState, useCallback } from "react";
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
      url: "/api/auth/telegram",
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

// export const useProcessTelegramAuth = () => {
//   const mutation = useMutation({
//     mutationFn: processTelegramAuth,
//     onMutate: () => {
//       toast.loading("Getting your Telegram account...", {
//         id: TOAST_ID,
//       });
//     },
//     onSuccess: () => {
//       toast.success("Your Telegram account has been retrieved successfully", {
//         id: TOAST_ID,
//       });
//     },
//     onError: () => {
//       toast.error("Failed to get your Telegram account", {
//         id: TOAST_ID,
//       });
//     },
//   });

//   return mutation;
// };

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

  // const handleApiResponse = useCallback(
  //   async (response: TelegramResponseData) => {
  //     try {
  //       const apiResponse = await fetch("/api/telegram", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(response),
  //       });

  //       console.log(apiResponse);

  //       if (!apiResponse.ok) {
  //         throw new Error(
  //           `API response failed with status: ${apiResponse.status}`
  //         );
  //       }

  //       const data: TelegramAuthApiResponse = await apiResponse.json();
  //       console.log("data in handleApiResponse", data);
  //       showSuccess("Telegram authorization successful.");
  //       onSuccess?.(data.user);
  //     } catch (error) {
  //       console.log("error in handleApiResponse", error);
  //       const errorMessage =
  //         error instanceof Error ? error.message : "Unknown error occurred";
  //       showError(`Telegram authorization failed: ${errorMessage}`);
  //     }
  //   },
  //   [onSuccess, showError, showSuccess]
  // );

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
