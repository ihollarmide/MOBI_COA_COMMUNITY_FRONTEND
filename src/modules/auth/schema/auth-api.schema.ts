import { z } from "zod";

// Validation schema for LoginUserBasePayload
export const authenticateUserPayloadSchema = z.object({
  xApiHeaders: z.object({
    "x-api-fingerprint": z
      .string({
        message: "Fingerprint is required",
      })
      .min(1, "Fingerprint must have at least 1 character"),
    "x-forwarded-for": z
      .string({
        message: "Forwarded for is required",
      })
      .min(1, "Forwarded for must have at least 1 character"),
    "x-api-useragent": z
      .string({
        message: "User agent is required",
      })
      .min(1, "User agent must have at least 1 character"),
  }),
  body: z.object({
    walletAddress: z
      .string({
        message: "Wallet address is required",
      })
      .min(1, "Wallet address must have at least 1 character"),
    signature: z
      .string({
        message: "Signature is required",
      })
      .min(1, "Signature must have at least 1 character"),
    chainId: z
      .number({
        message: "Chain ID is required",
      })
      .min(1, "Chain ID is required"),
  }),
  extras: z.object({
    uplineId: z.union([z.number(), z.null()]).optional(),
    isGenesisClaimed: z.boolean(),
  }),
});

// Validation schema for UserAuthResponse
export const userAuthResponseSchema = z.object({
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.number(),
      walletAddress: z.string(),
      telegramId: z.union([z.string(), z.number(), z.null()]),
      telegramUsername: z.union([z.string(), z.null()]).optional(),
      telegramJoined: z.boolean(),
      instagramUsername: z.union([z.string(), z.null()]).optional(),
      instagramFollowed: z.boolean(),
      twitterUsername: z.union([z.string(), z.null()]).optional(),
      twitterFollowed: z.boolean(),
      phoneNumberVerified: z.boolean(),
      phoneNumber: z.union([z.string(), z.null()]).optional(),
      isFlagged: z.boolean(),
      uplineId: z.number().nullable(),
      genesisClaimed: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  }),
  status: z.boolean().optional(),
  message: z.string().optional(),
});

// Validation schema for API error responses
export const apiErrorResponseSchema = z.object({
  data: z.string(),
  message: z.string(),
  status: z.boolean(),
});

// Validation schema for updating session data
export const updateSessionSchema = z.object({
  telegramId: z
    .union([
      z.string().min(1, "Telegram ID is required"),
      z.number().int().positive("Telegram ID must be a positive integer"),
    ])
    .optional(),

  accessToken: z
    .string({
      message: "Access token must be a string",
    })
    .min(1, "Access token is required")
    .optional(),
});

// Type exports
export type ValidatedAuthenticateUserPayload = z.infer<
  typeof authenticateUserPayloadSchema
>;
export type ValidatedUserAuthResponse = z.infer<typeof userAuthResponseSchema>;
export type ValidatedApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type ValidatedUpdateSessionPayload = z.infer<typeof updateSessionSchema>;
