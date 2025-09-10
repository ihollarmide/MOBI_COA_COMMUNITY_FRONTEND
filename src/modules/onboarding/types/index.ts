import { ApiResponse } from "@/common/types";
import {
  InstagramSteps,
  ONBOARDING_STEPS,
  TelegramSteps,
  XSteps,
} from "@/modules/onboarding/data";

export type OnboardingStepSlug = (typeof ONBOARDING_STEPS)[number]["slug"];
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type OnboardingStepNumber = (typeof ONBOARDING_STEPS)[number]["step"];

export type VerifySocialPayload = {
  username: string;
};

export type VerifyTelegramMembershipPayload = {
  telegramJoined: boolean;
  telegramUsername: string;
  telegramId: string | number;
};

export type VerifyTwitterPayload = {
  username: string;
  twitterId: string | number;
  tweetLink: string;
};

export interface SetUplineWithClaimPayload {
  deadline: number;
  tokenId: number;
  v: number;
  r: string;
  s: string;
}

export type GetClaimParametersResponse = ApiResponse<{
  v: number;
  r: string;
  s: string;
  userAddress: string;
  nftAddress: string;
  tokenId: number;
  nonce: number;
  deadline: number;
}>;

export type VerifySocialResponse = ApiResponse<{
  success: boolean;
}>;

export type RequestPhoneVerificationPayload = {
  phoneNumber: string;
};

export type VerifyPhoneVerificationPayload = {
  phone: string;
  code: string;
};

export type TelegramSteps = (typeof TelegramSteps)[number];
export type InstagramSteps = (typeof InstagramSteps)[number];
export type XSteps = (typeof XSteps)[number];
