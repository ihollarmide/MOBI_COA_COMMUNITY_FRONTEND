/* eslint-disable @typescript-eslint/no-explicit-any */
import { AUTH_ACTIONS } from "@/modules/auth/constants";
import { sessionSchema } from "@/modules/auth/schema";
import { AuthUser } from "@/modules/auth/types";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: AUTH_ACTIONS.CREATE_SESSION,
      credentials: {
        token: {
          type: "text",
        },
        user: {
          type: "json",
        },
      },
      authorize: async (credentials) => {
        let user = null;

        if (!credentials) {
          return null;
        }

        try {
          const userData =
            typeof credentials.user === "string"
              ? JSON.parse(credentials.user)
              : credentials.user;

          const token = credentials.token;

          if (!token || !userData) {
            return null;
          }

          // Validate the parsed data against the schema
          const validatedData = await sessionSchema.parseAsync({
            token,
            user: userData,
          });

          user = {
            ...validatedData.user,
            id: validatedData.user.id.toString(),
            walletAddress: validatedData.user.walletAddress as `0x${string}`,
            token: validatedData.token,
          };

          return user;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.token = user.token;
        token.user = {
          id: user.id,
          walletAddress: user.walletAddress,
          telegramJoined: user.telegramJoined,
          twitterFollowed: user.twitterFollowed,
          instagramFollowed: user.instagramFollowed,
          uplineId: user.uplineId,
          genesisClaimed: user.genesisClaimed,
          createdAt: user.createdAt,
        };
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = session.user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.token) {
        session.token = token.token as string;
      }
      if (token.user) {
        session.user = token.user as any;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");
      const isOnWelcome = nextUrl.pathname.startsWith("/welcome");

      if (isOnOnboarding) {
        if (isLoggedIn) {
          return true;
        }
        return false; // Redirect unauthenticated users to login page
      } else if (isOnWelcome) {
        // If the user is logged in and tries to access login/register pages,
        // redirect them to the dashboard.
        if (isLoggedIn) {
          return Response.redirect(new URL("/onboarding", nextUrl));
        }
        return true;
      }
      return true;
    },
  },
});

declare module "next-auth" {
  interface User extends AuthUser {
    token: string;
  }

  interface Session {
    token: string;
    user: AuthUser;
  }

  interface JWT {
    token: string;
    user: AuthUser;
  }
}
