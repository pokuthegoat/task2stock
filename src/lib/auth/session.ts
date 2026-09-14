import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/data/db/client";
import type { Session } from "@/lib/auth/types";

export const SESSION_COOKIE = "t2s_session";
const SESSION_DAYS = 30;

function sessionExpiry() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires,
  };
}

/**
 * Server-side session reader.
 * Looks up the httpOnly session cookie against AuthSession + User.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const row = await getPrisma().authSession.findUnique({
    where: { id: hashSessionToken(token) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          walletAddress: true,
          passwordHash: true,
        },
      },
    },
  });

  if (!row || row.expiresAt.getTime() <= Date.now()) {
    if (row) {
      await getPrisma().authSession.delete({ where: { id: row.id } });
    }

    return null;
  }

  return {
    user: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      walletAddress: row.user.walletAddress,
      hasPassword: Boolean(row.user.passwordHash),
    },
  };
});

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = sessionExpiry();

  await getPrisma().authSession.create({
    data: {
      id: hashSessionToken(token),
      userId,
      expiresAt,
    },
  });

  (await cookies()).set({
    name: SESSION_COOKIE,
    value: token,
    ...sessionCookieOptions(expiresAt),
  });
}

/** Drop every session for a user, then issue a new cookie for this request. */
export async function replaceSessionsForUser(userId: string): Promise<void> {
  await getPrisma().authSession.deleteMany({ where: { userId } });
  await createSession(userId);
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await getPrisma().authSession.deleteMany({
      where: { id: hashSessionToken(token) },
    });
  }

  store.set({
    name: SESSION_COOKIE,
    value: "",
    ...sessionCookieOptions(new Date(0)),
  });
}
