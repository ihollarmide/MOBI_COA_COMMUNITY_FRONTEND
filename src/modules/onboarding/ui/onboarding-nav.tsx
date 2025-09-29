import { Icon } from "@/components/icons/icon";
import { IconsNames } from "@/components/icons/icon.types";
import clsx from "clsx";
import { ONBOARDING_STEPS } from "../data";
import { useOnboardingUrlStates } from "../hooks/useOnboardingUrlStates";
import { OnboardingStepSlug } from "../types";
import {
  useGetStepToRedirectTo,
  useStepsCompletionStatus,
} from "../hooks/useStepsCompletionStatus";
import { canAccessStep } from "../lib/utils";

function NavItem({
  icon,
  isActive,
  isCompleted,
  isLast = false,
  onClick,
}: {
  icon: IconsNames;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
  onClick?: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="bg-glass-gradient shrink-0 inline-flex items-center justify-center rounded-[10px] border-[0.5px] border-white/[0.05] border-solid @sm:py-[11px] @sm:px-3 relative w-9 h-9 @sm:w-11 @sm:h-11 aspect-square"
      >
        <Icon
          name={isCompleted && !isActive ? IconsNames.CHECK : icon}
          width={20}
          height={20}
          className={clsx(
            "size-5 z-[1] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            {
              "text-primary": isCompleted || isActive,
              "text-white": !isCompleted && !isActive,
            }
          )}
        />
        <Icon
          name={isCompleted && !isActive ? IconsNames.CHECK : icon}
          width={20}
          height={20}
          className={clsx(
            "size-5 text-primary z-[2] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[4.5px] transition-opacity duration-300",
            {
              "opacity-0 pointer-events-none": !(isCompleted || isActive),
              "opacity-100 pointer-events-auto": isCompleted || isActive,
            }
          )}
        />
      </button>
      {!isLast ? (
        <div
          className={clsx("h-px flex-1 transition-colors duration-300", {
            "bg-primary": isCompleted,
            "bg-stroke": !isCompleted,
          })}
        />
      ) : null}
    </>
  );
}

export function OnboardingNav() {
  const [{ step: stepSlug }, setStep] = useOnboardingUrlStates();
  const stepsCompletionStatus = useStepsCompletionStatus();
  const accessibleSlug = useGetStepToRedirectTo();

  const isAccessible = (slug: OnboardingStepSlug) => {
    if (!accessibleSlug) return true;
    return canAccessStep({
      slugToAccess: slug,
      accessibleSlug: accessibleSlug,
    });
  };

  const handleStepClick = (slug: OnboardingStepSlug) => {
    if (!isAccessible(slug)) {
      return;
    }
    setStep({ step: slug });
  };

  return (
    <div className="w-full @container">
      <nav className="flex items-center w-full gap-1 @sm:gap-x-2.5">
        {ONBOARDING_STEPS.map((step, index) => (
          <NavItem
            key={step.slug}
            icon={step.icon}
            isActive={stepSlug === step.slug}
            isCompleted={stepsCompletionStatus.result[step.slug]}
            isLast={index === ONBOARDING_STEPS.length - 1}
            onClick={() => handleStepClick(step.slug)}
          />
        ))}
      </nav>
    </div>
  );
}
