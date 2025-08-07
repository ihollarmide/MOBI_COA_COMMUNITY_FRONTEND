import { createSerializer, parseAsStringLiteral, useQueryStates } from "nuqs";
import { ONBOARDING_STEPS } from "@/modules/onboarding/data";

export function useOnboardingUrlStates() {
  return useQueryStates({
    step: parseAsStringLiteral(
      ONBOARDING_STEPS.map((step) => step.slug)
    ).withDefault(ONBOARDING_STEPS[0].slug),
    tab: parseAsStringLiteral(["x", "instagram"]).withDefault("x"),
  });
}

const onboardingUrlStates = {
  step: parseAsStringLiteral(ONBOARDING_STEPS.map((step) => step.slug)),
  tab: parseAsStringLiteral(["x", "instagram"]),
};

export const serializeOnboardingUrlStates =
  createSerializer(onboardingUrlStates);
