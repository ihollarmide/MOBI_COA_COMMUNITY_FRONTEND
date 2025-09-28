import { ApiResponse } from "@/common/types";
import { Address } from "viem";

export type SessionData = {
  walletAddress: string;
  accessToken: string;
  telegramId: string | number | null;
  telegramJoined: boolean;
  telegramUsername?: string | null | undefined;
  twitterUsername?: string | null | undefined;
  twitterFollowed: boolean;
  instagramUsername?: string | null | undefined;
  instagramFollowed: boolean;
  phoneNumberVerified: boolean;
  phoneNumber?: string | null | undefined;
  isFlagged: boolean;
  uplineId: number | null;
  genesisClaimed: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface InitiateUserAuthenticationPayload {
  walletAddress: Address;
  appName: string;
}

export type InitiateUserAuthenticationResponse = ApiResponse<{
  messageToSign: string;
}>;

export interface CompleteSignatureVerificationHeaders {
  "x-api-fingerprint": string;
  "x-forwarded-for": string;
  "x-api-useragent": string;
}

export interface CompleteSignatureVerificationBody {
  walletAddress: Address;
  signature: string;
  chainId: number;
}

export interface CompleteAuthenticationExtras {
  uplineId: number | null;
  isGenesisClaimed: boolean;
}

export interface BaseCompleteAuthenticationPayload {
  xApiHeaders: CompleteSignatureVerificationHeaders;
  body: CompleteSignatureVerificationBody;
}

export interface CompleteAuthenticationPayload
  extends BaseCompleteAuthenticationPayload {
  extras: CompleteAuthenticationExtras;
}

export interface AuthUser {
  id: number;
  walletAddress: Address;
  telegramId: string | number | null;
  telegramUsername?: string | null;
  telegramJoined: boolean;
  telegramVerified: boolean;
  twitterFollowed: boolean;
  twitterUsername?: string | null;
  twitterId?: string | number | null | undefined;
  tweetLink?: string | null | undefined;
  instagramUsername?: string | null;
  instagramFollowed: boolean;
  uplineId: number | null;
  genesisClaimed: boolean;
  phoneNumberVerified: boolean;
  phoneNumber?: string | null;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CompleteUserAuthenticationResponse = ApiResponse<{
  token: string;
  user: AuthUser;
}>;

export type GetAuthStatusResponse = ApiResponse<AuthUser>;

export type GetVmccDetailsByCoaUserIdResponse = ApiResponse<{
  companyName: string;
  companyBanner: string | null;
  companyLogo: string | null;
  companyBio: string | null;
}>;

export type UserSession = {
  id: string;
  walletAddress: string;
  accessToken: string;
  isGenesisClaimed: boolean;
  isFlagged: boolean;
  isTelegramVerified: boolean;
  isInstagramVerified: boolean;
  uplineId: number | null;
  isTwitterVerified: boolean;
};
