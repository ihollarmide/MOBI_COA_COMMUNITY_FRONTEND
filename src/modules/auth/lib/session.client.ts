// lib/session.ts
import { SessionData } from "@/modules/auth/types";
import { EncryptJWT, jwtDecrypt } from "jose";

export const getSessionKey = () => {
  return process.env.NEXT_PUBLIC_APP_SESSION_NAME as string;
};

export async function createSessionInStorage({
  data,
  sessionSecret,
}: {
  data: SessionData;
  sessionSecret: string;
}) {
  const secret = new TextEncoder().encode(sessionSecret);
  const SESSION_NAME = getSessionKey();
  const token = await new EncryptJWT({ data })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .encrypt(secret);

  window.localStorage.setItem(SESSION_NAME, token);
}

export async function getSessionFromStorage({
  sessionSecret,
}: {
  sessionSecret: string;
}): Promise<SessionData | null> {
  const secret = new TextEncoder().encode(sessionSecret);
  const SESSION_NAME = getSessionKey();
  const cookie = window.localStorage.getItem(SESSION_NAME);
  if (!cookie) return null;

  try {
    const { payload } = await jwtDecrypt(cookie, secret);
    return payload.data as SessionData;
  } catch {
    return null;
  }
}

export async function updateSessionInStorage({
  partial,
  sessionSecret,
}: {
  partial: Partial<SessionData>;
  sessionSecret: string;
}) {
  const current = await getSessionFromStorage({ sessionSecret });
  if (!current) return null;
  const updated = { ...current, ...partial };
  await createSessionInStorage({ data: updated, sessionSecret });
  return updated;
}

export async function destroySessionInStorage() {
  const SESSION_NAME = getSessionKey();
  window.localStorage.removeItem(SESSION_NAME);
}
