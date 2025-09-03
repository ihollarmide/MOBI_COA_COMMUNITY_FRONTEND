import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_SECRET_KEY as string;

function verifyTelegramAuth(data: Record<string, string>) {
  const { hash, ...rest } = data;

  const dataCheckString = Object.keys(rest)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
}

export async function POST(req: NextRequest) {
  try {
    const data: Record<string, string> = await req.json();

    // Add a check to ensure the hash exists
    if (!data.hash) {
      return NextResponse.json(
        { error: "Invalid data: hash missing" },
        { status: 400 }
      );
    }

    const isValid = verifyTelegramAuth(data);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Telegram login" },
        { status: 401 }
      );
    }

    const user = {
      id: data.id,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      photo_url: data.photo_url,
    };
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error processing Telegram login:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}
