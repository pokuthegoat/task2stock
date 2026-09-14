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
  username: true,
  email: true,
  avatarUrl: true,
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

const googleUserSelect = {
  ...userSelect,
  googleSub: true,
} as const;

export async function findOrCreateGoogleUser(input: {
  sub: string;
  email: string;
  name: string;
}): Promise<AuthResult> {
  const googleSub = input.sub.trim();
  const email = normalizeEmail(input.email);
  const name = input.name.trim() || email.split("@")[0] || "Google user";

  if (!googleSub) {
    return toAuthUnavailableResult();
  }

  try {
    const bySub = await getPrisma().user.findUnique({
      where: { googleSub },
      select: googleUserSelect,
    });

    if (bySub) {
      return { ok: true, user: toAuthUser(bySub) };
    }

    const byEmail = await getPrisma().user.findUnique({
      where: { email },
      select: googleUserSelect,
    });

    if (byEmail) {
      if (byEmail.googleSub && byEmail.googleSub !== googleSub) {
        return {
          ok: false,
          code: "EMAIL_TAKEN",
          message: "An account with this email already exists.",
        };
      }

      if (!byEmail.googleSub) {
        const linked = await getPrisma().user.update({
          where: { id: byEmail.id },
          data: { googleSub },
          select: googleUserSelect,
        });

        return { ok: true, user: toAuthUser(linked) };
      }

      return { ok: true, user: toAuthUser(byEmail) };
    }

    const created = await getPrisma().user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        googleSub,
        passwordHash: null,
      },
      select: googleUserSelect,
    });

    return { ok: true, user: toAuthUser(created) };
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      const existing = await getPrisma().user.findUnique({
        where: { googleSub },
        select: googleUserSelect,
      });

      if (existing) {
        return { ok: true, user: toAuthUser(existing) };
      }
    }

    logDatabaseError("googleSignIn", error);
    return toAuthUnavailableResult();
  }
}

export async function signOut(): Promise<void> {
  await destroySession();
}
