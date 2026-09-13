import "server-only";

import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getPrisma } from "@/lib/data/db/client";

export const GOOGLE_STATE_COOKIE = "t2s_google_state";

export function isGoogleOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function getAppUrl() {
  const configured = process.env.APP_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return null;
}

export async function resolveAppUrl() {
  const configured = getAppUrl();

  if (configured) {
    return configured;
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}

export function googleCallbackPath() {
  return "/auth/google/callback";
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires,
  };
}

export async function beginGoogleOAuth() {
  if (!isGoogleOAuthConfigured()) {
    return null;
  }

  const state = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  (await cookies()).set({
    name: GOOGLE_STATE_COOKIE,
    value: state,
    ...cookieOptions(expires),
  });

  const appUrl = await resolveAppUrl();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${appUrl}${googleCallbackPath()}`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function finishGoogleOAuth(input: {
  code: string | null;
  state: string | null;
}) {
  if (!isGoogleOAuthConfigured()) {
    return { ok: false as const, message: "Google sign-in is not configured." };
  }

  const store = await cookies();
  const expected = store.get(GOOGLE_STATE_COOKIE)?.value;
  store.set({
    name: GOOGLE_STATE_COOKIE,
    value: "",
    ...cookieOptions(new Date(0)),
  });

  if (!input.code || !input.state || !expected || input.state !== expected) {
    return { ok: false as const, message: "Google sign-in could not be verified." };
  }

  const appUrl = await resolveAppUrl();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${appUrl}${googleCallbackPath()}`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    return { ok: false as const, message: "Google could not complete sign-in." };
  }

  const tokens = (await tokenResponse.json()) as { access_token?: string };
  const accessToken = tokens.access_token;

  if (!accessToken) {
    return { ok: false as const, message: "Google did not return a user profile." };
  }

  const profileResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!profileResponse.ok) {
    return { ok: false as const, message: "Google did not return a user profile." };
  }

  const profile = (await profileResponse.json()) as {
    email?: string;
    name?: string;
    verified_email?: boolean;
  };

  if (!profile.email || profile.verified_email === false) {
    return {
      ok: false as const,
      message: "Google did not provide a verified email.",
    };
  }

  const email = normalizeEmail(profile.email);
  const name = profile.name?.trim() || email.split("@")[0] || "Task2Stock user";
  const prisma = getPrisma();
  let user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name,
          email,
          passwordHash: await hashPassword(randomBytes(32).toString("hex")),
        },
        select: { id: true, name: true, email: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true },
        });
      } else {
        throw error;
      }
    }
  }

  if (!user) {
    return { ok: false as const, message: "Could not create your account." };
  }

  await createSession(user.id);
  return { ok: true as const };
}
