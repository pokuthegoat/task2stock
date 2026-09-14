import "server-only";

import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth/password";
import { createSession, destroySession, toAuthUser } from "@/lib/auth/session";
import type { AuthResult } from "@/lib/auth/types";
import { getPrisma } from "@/lib/data/db/client";
import {
  isDuplicateConstraintError,
  logDatabaseError,
  toAuthUnavailableResult,
} from "@/lib/data/db/errors";

const userSelect = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
} as const;

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const email = normalizeEmail(input.email);
    const user = await getPrisma().user.findUnique({
      where: { email },
      select: userSelect,
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
  } catch (error) {
    logDatabaseError("signIn", error);
    return toAuthUnavailableResult();
  }
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
      select: userSelect,
    });

    await createSession(user.id);
    return { ok: true, user: toAuthUser(user) };
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      return {
        ok: false,
        code: "EMAIL_TAKEN",
        message: "An account with this email already exists.",
      };
    }

    logDatabaseError("signUp", error);
    return toAuthUnavailableResult();
  }
}

export async function findOrCreateGoogleUser(input: {
  email: string;
  name: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim() || email.split("@")[0] || "Google user";

  try {
    const existing = await getPrisma().user.findUnique({
      where: { email },
      select: userSelect,
    });

    if (existing) {
      return { ok: true, user: toAuthUser(existing) };
    }

    const created = await getPrisma().user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: null,
      },
      select: userSelect,
    });

    return { ok: true, user: toAuthUser(created) };
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      const existing = await getPrisma().user.findUnique({
        where: { email },
        select: userSelect,
      });

      if (existing) {
        return { ok: true, user: toAuthUser(existing) };
      }
    }

    logDatabaseError("googleSignIn", error);
    return toAuthUnavailableResult();
  }
}

export async function updateAccountName(input: {
  userId: string;
  name: string;
}): Promise<AuthResult> {
  const name = input.name.trim();
  const user = await getPrisma().user.findUnique({
    where: { id: input.userId },
    select: userSelect,
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
    select: userSelect,
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
    select: userSelect,
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
