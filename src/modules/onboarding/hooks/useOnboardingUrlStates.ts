import { createSerializer, parseAsStringLiteral, useQueryStates } from "nuqs";
import {
  InstagramSteps,
  ONBOARDING_STEPS,
  SOCIAL_PLATFORMS,
  TelegramSteps,
  XSteps,
} from "@/modules/onboarding/data";

export function useOnboardingUrlStates() {
  return useQueryStates({
    step: parseAsStringLiteral(
      ONBOARDING_STEPS.map((step) => step.slug)
    ).withDefault(ONBOARDING_STEPS[0].slug),
    tab: parseAsStringLiteral(SOCIAL_PLATFORMS).withDefault("x"),
    x: parseAsStringLiteral(XSteps).withDefault("signin"),
    instagram: parseAsStringLiteral(InstagramSteps).withDefault("follow"),
    telegram: parseAsStringLiteral(TelegramSteps).withDefault("join"),
  });
}

const onboardingUrlStates = {
  step: parseAsStringLiteral(ONBOARDING_STEPS.map((step) => step.slug)),
  tab: parseAsStringLiteral(SOCIAL_PLATFORMS),
  x: parseAsStringLiteral(XSteps),
  instagram: parseAsStringLiteral(InstagramSteps),
  telegram: parseAsStringLiteral(TelegramSteps),
};

export const serializeOnboardingUrlStates =
  createSerializer(onboardingUrlStates);
