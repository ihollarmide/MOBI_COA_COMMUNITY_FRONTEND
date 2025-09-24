import { z } from "zod";

// Validation schema for UserAuthResponse
export const completeSigninSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
  accessToken: z.string(),
  isGenesisClaimed: z.boolean(),
  isFlagged: z.boolean(),
  isTelegramVerified: z.boolean(),
  isInstagramVerified: z.boolean(),
  uplineId: z.number().nullable(),
  isTwitterVerified: z.boolean(),
});

// Validation schema for API error responses
export const apiErrorResponseSchema = z.object({
  data: z.string(),
  message: z.string(),
  status: z.boolean(),
});

// Validation schema for updating session data
export const updateSessionSchema = z.object({
  isTelegramVerified: z.boolean().optional(),
  uplineId: z.union([z.string(), z.null()]).optional(),
  isGenesisClaimed: z.boolean().optional(),
  isInstagramVerified: z.boolean().optional(),
  isTwitterVerified: z.boolean().optional(),
  accessToken: z
    .string({
      message: "Access token must be a string",
    })
    .min(1, "Access token is required")
    .optional(),
});

// Type exports

export type ValidatedUpdateSessionPayload = z.infer<typeof updateSessionSchema>;
