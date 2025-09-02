"use server";

import { verifyRecaptchaV2Token, verifyRecaptchaV3Token } from "@/lib/captcha";


export const connectWalletAction = async ({
  v2Token,
  v3Token,
}: {
  v2Token?: string | null | undefined;
  v3Token?: string | null | undefined;
}) => {
  if (!v2Token && !v3Token) {
    return {
      success: false,
      message: "Token not found",
    };
  }

  // Priority 1: Check if a v2 token was sent (from the fallback challenge)
  if (v2Token) {
    const v2Response = await verifyRecaptchaV2Token(v2Token);
    if (v2Response?.success) {
      return {
        success: true,
        message: "You are allowed to connect your wallet",
      };
    } else {
      return {
        success: false,
        message: "V2 Captcha verification failed. Please try again.",
        errors: v2Response ? v2Response["error-codes"] : undefined,
      };
    }
  }

  // Priority 2: Check the initial v3 token
  if (v3Token) {
    const v3Response = await verifyRecaptchaV3Token(v3Token);

    if (!v3Response) {
      return { success: false, message: "Captcha verification failed" };
    }

    // If v3 score is high enough, success!
    if (v3Response.success && v3Response.score >= 0.5) {
      return {
        success: true,
        message: "You are allowed to connect your wallet",
      };
    }

    // THE KEY CHANGE: If v3 score is too low, ask for v2 verification
    if (!v3Response.success || v3Response.score < 0.5) {
      return {
        success: false,
        message: "Please complete the challenge below.",
        requireV2: true, // Tell the client to show the v2 widget
      };
    }
  }

  // Fallback error if no token is provided
  return {
    success: false,
    message: "No token provided.",
  };
};
