import "server-only";

import { Prisma } from "@prisma/client";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import type { AuthResult } from "@/lib/auth/types";
import { toAuthUser } from "@/lib/auth/wallet";
import { getPrisma } from "@/lib/data/db/client";

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
      walletAddress: true,
      passwordHash: true,
    },
  });

  if (
    !user ||
    !user.passwordHash ||
    !(await verifyPassword(input.password, user.passwordHash))
  ) {
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
      select: {
        id: true,
        name: true,
        email: true,
        walletAddress: true,
        passwordHash: true,
      },
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
    select: {
      id: true,
      name: true,
      email: true,
      walletAddress: true,
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

  const updated = await getPrisma().user.update({
    where: { id: user.id },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      walletAddress: true,
      passwordHash: true,
    },
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
      walletAddress: true,
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

  if (
    !user.passwordHash ||
    !(await verifyPassword(input.currentPassword, user.passwordHash))
  ) {
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

export async function signOut(): Promise<void> {
  await destroySession();
}
