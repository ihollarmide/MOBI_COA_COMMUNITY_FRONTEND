import { ApiResponse } from "@/common/types";
import { Address } from "viem";

export interface InitiateLoginPayload {
  walletAddress: Address;
  appName: string;
}

export type InitiateLoginResponse = ApiResponse<{
  messageToSign: string;
}>;

export interface CompleteLoginPayload {
  walletAddress: Address;
  signature: string;
  chainId: number;
}

export interface AuthUser {
  id: number;
  walletAddress: Address;
  telegramJoined: boolean;
  twitterFollowed: boolean;
  instagramFollowed: boolean;
  uplineId: number | null;
  genesisClaimed: boolean;
  createdAt: string;
}

export type CompleteLoginResponse = ApiResponse<{
  token: string;
  user: AuthUser;
}>;

export type GetAuthStatusResponse = ApiResponse<{
  id: number;
  walletAddress: Address;
  telegramJoined: boolean;
  twitterFollowed: boolean;
  instagramFollowed: boolean;
  uplineId: number | null;
  genesisClaimed: boolean;
  createdAt: string;
}>;

export type GetVmccDetailsByCoaUserIdResponse = ApiResponse<{
  companyName: string;
  companyBanner: string | null;
  companyLogo: string | null;
  companyBio: string | null;
}>;
