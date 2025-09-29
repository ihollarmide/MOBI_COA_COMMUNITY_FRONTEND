/* eslint-disable @typescript-eslint/no-explicit-any */
import { completeSigninSchema } from "@/modules/auth/schema/auth-api.schema";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        payload: { label: "Complete Signin Payload" },
      },
      authorize: async (credentials) => {
        const { payload } = credentials;

        const payloadData = JSON.parse(payload as unknown as string);
        const response = completeSigninSchema.safeParse(payloadData);

        if (!response) {
          return null;
        }

        if (!response.success) {
          return null;
        }

        const user = response.data;
        return user;
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
    jwt: async ({ token, user, trigger }) => {
      if (trigger === "signIn") {
        token = {
          ...token,
          ...user,
        };
      }
      return token;
    },
    session: async ({ session, token, trigger }) => {
      if (trigger === "update") {
        session.user.isGenesisClaimed = token.isGenesisClaimed as boolean;
        session.user.isTelegramVerified = token.isTelegramVerified as boolean;
        session.user.isInstagramVerified = token.isInstagramVerified as boolean;
        session.user.uplineId = token.uplineId as number | null;
        session.user.isTwitterVerified = token.isTwitterVerified as boolean;
        session.user.accessToken = token.accessToken as string;
        console.log("in session callback trigger === update, ", session);
      } else {
        session.user = token as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/welcome",
    error: "/welcome",
    signOut: "/welcome",
  },
});
