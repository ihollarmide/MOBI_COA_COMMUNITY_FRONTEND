import { ONBOARDING_STEPS } from "../data";
import { OnboardingStepNumber, OnboardingStepSlug } from "../types";
import { isValidPhoneNumber } from "react-phone-number-input";

export const getStepNumberBySlug = (
  slug: OnboardingStepSlug
): OnboardingStepNumber => {
  const stepIndex = ONBOARDING_STEPS.findIndex((step) => step.slug === slug);
  if (stepIndex === -1) {
    throw new Error(`Invalid onboarding step path: ${slug}`);
  }
  return ONBOARDING_STEPS[stepIndex].step;
};

export const getStepSlugByNumber = (stepNumber: number): OnboardingStepSlug => {
  const step = ONBOARDING_STEPS.find((step) => step.step === stepNumber);
  if (!step) {
    throw new Error(`Invalid onboarding step number: ${stepNumber}`);
  }
  return step.slug;
};

export const getNextStep = (
  currentSlug: OnboardingStepSlug
): OnboardingStepSlug => {
  const currentStep = getStepNumberBySlug(currentSlug);
  const nextStepNumber = currentStep + 1;
  return getStepSlugByNumber(nextStepNumber);
};

export const getPreviousStep = (
  currentSlug: OnboardingStepSlug
): OnboardingStepSlug => {
  const currentStep = getStepNumberBySlug(currentSlug);
  const previousStepNumber = currentStep - 1;
  return getStepSlugByNumber(previousStepNumber);
};

export const isFirstStep = (slug: OnboardingStepSlug): boolean => {
  return getStepNumberBySlug(slug) === 1;
};

export const isLastStep = (slug: OnboardingStepSlug): boolean => {
  return getStepNumberBySlug(slug) === ONBOARDING_STEPS.length;
};

export function canAccessStep({
  slugToAccess,
  accessibleSlug,
}: {
  slugToAccess: OnboardingStepSlug;
  accessibleSlug: OnboardingStepSlug;
}) {
  const accessibleSlugNumber = getStepNumberBySlug(accessibleSlug);
  const slugToAccessNumber = getStepNumberBySlug(slugToAccess);

  return slugToAccessNumber <= accessibleSlugNumber;
}

export const CHARACTER_LIMITS = {
  x: {
    min: 4,
    max: 15,
  },
  instagram: {
    min: 1,
    max: 32,
  },
  telegram: {
    min: 5,
    max: 32,
  },
};

export const isValidUsernameWithAtSign = (
  username: string,
  platform: "x" | "instagram" | "telegram"
): { isError: boolean; error: string | null } => {
  // Check if username is empty or undefined
  if (!username || username.trim().length === 0) {
    return { isError: true, error: "Username is required" };
  }

  // Remove @ if present for validation
  const usernameWithoutAt = username.startsWith("@")
    ? username.slice(1)
    : username;

  const { min, max } = CHARACTER_LIMITS[platform];
  const isUsernameTooShort = usernameWithoutAt.length < min;
  const isUsernameTooLong = usernameWithoutAt.length > max;

  const platformName =
    platform === "x"
      ? "X"
      : platform === "instagram"
        ? "Instagram"
        : "Telegram";

  if (isUsernameTooShort) {
    return {
      isError: true,
      error: `${platformName} Username must be at least ${min} characters`,
    };
  }

  if (isUsernameTooLong) {
    return {
      isError: true,
      error: `${platformName} Username must be at most ${max} characters`,
    };
  }

  // Check for valid characters (alphanumeric, underscore, hyphen)
  const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validUsernameRegex.test(usernameWithoutAt)) {
    return {
      isError: true,
      error:
        "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }

  // // Check for consecutive special characters
  // if (/[_-]{2,}/.test(usernameWithoutAt)) {
  //   return {
  //     isError: true,
  //     error: "Username cannot have consecutive underscores or hyphens",
  //   };
  // }

  return { isError: false, error: null };
};

export const isValidPostLink = (
  postLink: string,
  platform: "x" | "instagram"
): { isError: boolean; error: string | null } => {
  // Check if postLink is empty or undefined
  if (!postLink || postLink.trim().length === 0) {
    return {
      isError: true,
      error: `Valid ${platform === "x" ? "X tweet" : "Instagram post"} link is required`,
    };
  }

  const trimmedLink = postLink.trim();

  // Basic URL validation
  try {
    new URL(trimmedLink);
  } catch {
    return { isError: true, error: "Please enter a valid URL" };
  }

  // Platform-specific validation
  if (platform === "x") {
    // Validate X (Twitter) post link
    const xPostRegex =
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+(\?.*)?$/;
    if (!xPostRegex.test(trimmedLink)) {
      return {
        isError: true,
        error:
          "Please enter a valid X (Twitter) post link (e.g., https://x.com/username/status/1234567890)",
      };
    }
  } else if (platform === "instagram") {
    // Validate Instagram post link
    const instagramPostRegex =
      /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?(\?.*)?$/;
    if (!instagramPostRegex.test(trimmedLink)) {
      return {
        isError: true,
        error:
          "Please enter a valid Instagram post link (e.g., https://instagram.com/p/ABC123/)",
      };
    }
  }

  return { isError: false, error: null };
};

export const isValidReferralCode = (
  referralCode: string
): { isError: boolean; error: string | null } => {
  // Check if referral code is empty or undefined
  if (!referralCode || referralCode.trim().length === 0) {
    return { isError: true, error: "Referral code is required" };
  }

  // Check if referral code starts with "MCL"
  if (!referralCode.startsWith("MCL")) {
    return { isError: true, error: "Referral code must start with MCL" };
  }

  // Check if referral code has exactly 9 characters (MCL + 6 digits)
  if (referralCode.length !== 9) {
    return {
      isError: true,
      error: "Referral code must be exactly 9 characters (MCL + 6 digits)",
    };
  }

  // Check if the part after "MCL" contains exactly 6 digits
  const digitsPart = referralCode.slice(3);
  const validDigitsRegex = /^\d{6}$/;
  if (!validDigitsRegex.test(digitsPart)) {
    return {
      isError: true,
      error: "Referral code must have exactly 6 digits after MCL",
    };
  }

  return { isError: false, error: null };
};

export const removeAtSign = (username: string) => {
  return username.replace("@", "").trim();
};

export const isPhoneNumberValid = (phoneNumber: string) => {
  const isValid = isValidPhoneNumber(phoneNumber);
  return {
    isError: !isValid,
    error: isValid ? null : "Invalid phone number",
  };
};

export const isOtpValid = (otp: string) => {
  return {
    isError: otp.length !== 6,
    error: otp.length !== 6 ? "Invalid OTP" : null,
  };
};

export function buildTweetPostLink({
  text,
  referralCode,
  hashtags = [],
  url,
}: {
  text: string;
  referralCode: string;
  hashtags: string[];
  url?: string;
}) {
  // Append referral code to text if provided
  let fullText = text;
  if (referralCode) {
    fullText += ` Referral Code: ${referralCode}`;
  }

  const params = new URLSearchParams({
    text: fullText,
  });

  if (hashtags.length > 0) {
    params.set("hashtags", hashtags.join(","));
  }

  if (url) {
    params.set("url", url);
  }

  return `https://x.com/intent/tweet?${params.toString()}`;
}
