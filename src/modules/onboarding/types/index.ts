import { ONBOARDING_STEPS } from "@/modules/onboarding/data";

export type OnboardingStepSlug = (typeof ONBOARDING_STEPS)[number]["slug"];
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type OnboardingStepNumber = (typeof ONBOARDING_STEPS)[number]["step"];
