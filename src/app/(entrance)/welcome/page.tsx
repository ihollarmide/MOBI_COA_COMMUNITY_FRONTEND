import { WelcomeScreen } from "@/modules/onboarding/ui/welcome-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COA Airdrop | Welcome",
  description:
    "The COA Airdrop is a community airdrop for the Mobi Automation project. It is a way for the community to get involved in the project and to get rewarded for their participation.",
};

export default function MainPage() {
  const fingerPrintKey = process.env.FINGERPRINT_SECRET_KEY;

  return <WelcomeScreen fingerPrintKey={fingerPrintKey} />;
}
