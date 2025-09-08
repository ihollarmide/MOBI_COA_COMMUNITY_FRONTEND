// lib/session.ts
import { SessionData } from "@/modules/auth/types";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { SESSION_MAX_AGE } from "@/modules/auth/constants";

const SESSION_NAME = process.env.NEXT_PUBLIC_APP_SESSION_NAME as string;
const secret = new TextEncoder().encode(process.env.SESSION_SECRET! as string);

export async function createSession(
  data: SessionData,
  newSession: boolean = true
) {
  const token = await new EncryptJWT({ data })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .encrypt(secret);

  (await cookies()).set(SESSION_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: newSession ? new Date(Date.now() + SESSION_MAX_AGE) : undefined,
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookie = (await cookies()).get(SESSION_NAME)?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtDecrypt(cookie, secret);
    return payload.data as SessionData;
  } catch {
    return null;
  }
}

export async function updateSession(partial: Partial<SessionData>) {
  const current = await getSession();
  if (!current) return null;
  const updated = { ...current, ...partial };
  await createSession(updated, false);
  return updated;
}

export async function destroySession() {
  (await cookies()).delete(SESSION_NAME);
}
