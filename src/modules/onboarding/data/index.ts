import { IconsNames } from "@/components/icons/icon.types";

export const ONBOARDING_STEPS: {
  title: string;
  step: number;
  slug:
    | "wallet-connected"
    // | "verify-phone-number"
    | "join-telegram"
    | "follow-us"
    | "enter-referral-code"
    | "claim-genesis-key"
    | "join-vmcc-dao";
  icon: IconsNames;
}[] = [
  {
    title: "Connect your BEP20 wallet.",
    icon: IconsNames.WALLET_1,
    step: 1,
    slug: "wallet-connected",
  },
  // {
  //   title: "Verify your phone number.",
  //   icon: IconsNames.PHONE,
  //   step: 2,
  //   slug: "verify-phone-number",
  // },
  {
    title: "Join the Atlantus City Hall Telegram Community.",
    icon: IconsNames.USERS_3,
    step: 2,
    slug: "join-telegram",
  },
  {
    title: "Follow us on X, post a tweet and follow us on Instagram (or both).",
    icon: IconsNames.THUMBS_UP,
    step: 3,
    slug: "follow-us",
  },
  {
    title: "Enter Referral Code.",
    icon: IconsNames.PASSCODE,
    step: 4,
    slug: "enter-referral-code",
  },
  {
    title: "Claim your Genesis Key.",
    icon: IconsNames.KEY_1,
    step: 5,
    slug: "claim-genesis-key",
  },
  {
    title: "Join the VMCC Builder DAO on Telegram.",
    icon: IconsNames.TELEGRAM,
    step: 6,
    slug: "join-vmcc-dao",
  },
] as const;
