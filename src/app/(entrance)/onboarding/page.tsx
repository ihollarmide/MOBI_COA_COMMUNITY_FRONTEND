import { MainScreen } from "@/modules/onboarding/ui/main-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COA Airdrop | Mobi Automation",
  description:
    "The COA Airdrop is a community airdrop for the Mobi Automation project. It is a way for the community to get involved in the project and to get rewarded for their participation.",
};

export default function OnboardingPage() {
  return <MainScreen />;
}
