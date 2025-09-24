/* eslint-disable */
import { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    walletAddress: string;
    accessToken: string;
    isGenesisClaimed: boolean;
    isFlagged: boolean;
    isTelegramVerified: boolean;
    isInstagramVerified: boolean;
    uplineId: number | null;
    isTwitterVerified: boolean;
  }

  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      walletAddress: string;
      accessToken: string;
      isGenesisClaimed: boolean;
      isFlagged: boolean;
      isTelegramVerified: boolean;
      isInstagramVerified: boolean;
      uplineId?: string | number | null | undefined;
      isTwitterVerified: boolean;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    walletAddress: string;
    accessToken: string;
    isGenesisClaimed: boolean;
    isFlagged: boolean;
    isTelegramVerified: boolean;
    isInstagramVerified: boolean;
    uplineId?: string | number | null | undefined;
    isTwitterVerified: boolean;
  }
}
