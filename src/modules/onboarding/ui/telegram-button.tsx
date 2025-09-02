"use client";

import { Button } from "@/components/ui/button";

export function TelegramButton({
  onClick
}: {
  onClick?: () => void;
}) {
  const handleSignInWithTelegram = () => {
    onClick?.();
    // const bot = "mobi_automation_sample_bot"; // no "@"
    // const bot = "8287799630";

    const botId = "8287799630"; // e.g. "547043436"
    const origin = encodeURIComponent("https://9d97eaff6d54.ngrok-free.app");
    const returnTo = encodeURIComponent(`https://9d97eaff6d54.ngrok-free.app/auth/telegram/callback`);


    // Open Telegram OAuth popup
    window.open(
      `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${origin}&return_to=${returnTo}`,
      "_blank",
      "width=500,height=600"
    );

  };

  return (
    <Button
      onClick={handleSignInWithTelegram}
      className="cursor-pointer"
    >
      Sign in with Telegram
    </Button>
  );
}
