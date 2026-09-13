import "server-only";

import { Prisma } from "@prisma/client";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import type { AuthResult, AuthUser } from "@/lib/auth/types";
import { getPrisma } from "@/lib/data/db/client";

const GOOGLE_NOT_CONNECTED: AuthResult = {
  ok: false,
  code: "NOT_CONNECTED",
  message: "Google sign-in is not connected yet. No OAuth flow was started.",
};

function toAuthUser(user: { id: string; name: string; email: string }): AuthUser {
  return { id: user.id, name: user.name, email: user.email };
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const user = await getPrisma().user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: "Email or password is incorrect.",
    };
  }

  await createSession(user.id);
  return { ok: true, user: toAuthUser(user) };
}

export async function signUpWithPassword(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await getPrisma().user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash,
      },
      select: { id: true, name: true, email: true },
    });

    await createSession(user.id);
    return { ok: true, user: toAuthUser(user) };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        code: "EMAIL_TAKEN",
        message: "An account with this email already exists.",
      };
    }

    throw error;
  }
}

export async function updateAccountName(input: {
  userId: string;
  name: string;
}): Promise<AuthResult> {
  const name = input.name.trim();
  const user = await getPrisma().user.findUnique({
    where: { id: input.userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: "Sign in to manage your account.",
    };
  }

  const updated = await getPrisma().user.update({
    where: { id: user.id },
    data: { name },
    select: { id: true, name: true, email: true },
  });

  return { ok: true, user: toAuthUser(updated) };
}

export async function changeAccountPassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResult> {
  const user = await getPrisma().user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: "Sign in to manage your account.",
    };
  }

  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: "Current password is incorrect.",
    };
  }

  await getPrisma().user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });

  return { ok: true, user: toAuthUser(user) };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  return GOOGLE_NOT_CONNECTED;
}

export async function signOut(): Promise<void> {
  await destroySession();
}
