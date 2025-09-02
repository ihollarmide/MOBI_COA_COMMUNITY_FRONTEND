import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_SECRET_KEY;

function verifyTelegramAuth(data: Record<string, string>) {
  const { hash, ...rest } = data;

  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(BOT_TOKEN)
    .digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  console.log("hmac", hmac);
  console.log("hash", hash);

  return hmac === hash;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const data: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    data[key] = value;
  });

  const isValid = verifyTelegramAuth(data);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid Telegram login" }, { status: 401 });
  }

  const user = {
    id: data.id,
    username: data.username,
    first_name: data.first_name,
    last_name: data.last_name,
    photo_url: data.photo_url,
  };

  console.log("user", user);

  // TODO: create session or JWT cookie here
  return NextResponse.json({ success: true, user });
}
