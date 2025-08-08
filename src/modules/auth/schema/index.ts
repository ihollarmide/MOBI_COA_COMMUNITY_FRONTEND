import z from "zod";

export const sessionSchema = z.object({
  token: z.string().min(1, { message: "Access token is required" }),
  user: z.object({
    id: z.string(),
    walletAddress: z.string(),
    telegramJoined: z.boolean(),
    twitterFollowed: z.boolean(),
    instagramFollowed: z.boolean(),
    uplineId: z.number().nullable(),
    genesisClaimed: z.boolean(),
    createdAt: z.string(),
  }),
});
