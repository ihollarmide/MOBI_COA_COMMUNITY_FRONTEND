import { ONBOARDING_STEPS } from "../data";
import { OnboardingStepNumber, OnboardingStepSlug } from "../types";

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

export const isValidUsernameWithAtSign = (
  username: string
): { isError: boolean; error: string | null } => {
  // Check if username is empty or undefined
  if (!username || username.trim().length === 0) {
    return { isError: true, error: "Username is required" };
  }

  // Remove @ if present for validation
  const usernameWithoutAt = username.startsWith("@")
    ? username.slice(1)
    : username;

  // Check if username has minimum length
  if (usernameWithoutAt.length < 1) {
    return {
      isError: true,
      error: "Username must be at least 1 character",
    };
  }

  // Check if username has maximum length (common social media limits)
  if (usernameWithoutAt.length > 15) {
    return {
      isError: true,
      error: "Username must be 15 characters or less",
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

  // Check for consecutive special characters
  if (/[_-]{2,}/.test(usernameWithoutAt)) {
    return {
      isError: true,
      error: "Username cannot have consecutive underscores or hyphens",
    };
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
