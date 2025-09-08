import { NextResponse } from "next/server";
import { destroySession } from "@/modules/auth/lib/session";

export async function POST() {
  await destroySession();
  return NextResponse.json({
    success: true,
    message: "Logout successful",
  });
}
