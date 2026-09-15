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

const privyUserSelect = {
  ...userSelect,
  privyDid: true,
  walletAddress: true,
} as const;

function normalizePrivyWallet(address: string | null) {
  const value = address?.trim() || "";

  if (!value) return null;

  return /^0x[0-9a-fA-F]+$/.test(value) ? value.toLowerCase() : value;
}

async function linkPrivyIdentity(input: {
  id: string;
  privyDid: string;
  walletAddress: string | null;
}) {
  try {
    return await getPrisma().user.update({
      where: { id: input.id },
      data: {
        privyDid: input.privyDid,
        walletAddress: input.walletAddress,
      },
      select: privyUserSelect,
    });
  } catch (error) {
    if (!isDuplicateConstraintError(error) || !input.walletAddress) {
      throw error;
    }

    return getPrisma().user.update({
      where: { id: input.id },
      data: { privyDid: input.privyDid },
      select: privyUserSelect,
    });
  }
}

export async function findOrCreatePrivyUser(input: {
  did: string;
  email: string | null;
  name: string;
  walletAddress: string | null;
}): Promise<AuthResult> {
  const privyDid = input.did.trim();
  const email = input.email ? input.email.trim().toLowerCase() : null;
  const name = input.name.trim() || email?.split("@")[0] || "Privy user";
  const walletAddress = normalizePrivyWallet(input.walletAddress);

  if (!privyDid) {
    return toAuthUnavailableResult();
  }

  try {
    const byDid = await getPrisma().user.findUnique({
      where: { privyDid },
      select: privyUserSelect,
    });

    if (byDid) {
      const nextWallet =
        walletAddress && byDid.walletAddress !== walletAddress
          ? walletAddress
          : byDid.walletAddress;

      if (nextWallet !== byDid.walletAddress) {
        try {
          const updated = await getPrisma().user.update({
            where: { id: byDid.id },
            data: { walletAddress: nextWallet },
            select: privyUserSelect,
          });
          return { ok: true, user: toAuthUser(updated) };
        } catch (error) {
          if (!isDuplicateConstraintError(error)) {
            throw error;
          }
        }
      }

      return { ok: true, user: toAuthUser(byDid) };
    }

    if (email) {
      const byEmail = await getPrisma().user.findUnique({
        where: { email },
        select: privyUserSelect,
      });

      if (byEmail) {
        if (byEmail.privyDid && byEmail.privyDid !== privyDid) {
          return {
            ok: false,
            code: "EMAIL_TAKEN",
            message: "An account with this email already exists.",
          };
        }

        const linked = await linkPrivyIdentity({
          id: byEmail.id,
          privyDid,
          walletAddress: walletAddress ?? byEmail.walletAddress,
        });

        return { ok: true, user: toAuthUser(linked) };
      }
    }

    if (walletAddress) {
      const byWallet = await getPrisma().user.findUnique({
        where: { walletAddress },
        select: privyUserSelect,
      });

      if (byWallet) {
        if (byWallet.privyDid && byWallet.privyDid !== privyDid) {
          // Another Task2Stock user already owns this wallet. Create by DID only.
        } else {
          const linked = await linkPrivyIdentity({
            id: byWallet.id,
            privyDid,
            walletAddress,
          });
          return { ok: true, user: toAuthUser(linked) };
        }
      }
    }

    try {
      const created = await getPrisma().user.create({
        data: {
          id: crypto.randomUUID(),
          name,
          email,
          privyDid,
          walletAddress,
          passwordHash: null,
        },
        select: privyUserSelect,
      });

      return { ok: true, user: toAuthUser(created) };
    } catch (error) {
      if (!isDuplicateConstraintError(error) || !walletAddress) {
        throw error;
      }

      const created = await getPrisma().user.create({
        data: {
          id: crypto.randomUUID(),
          name,
          email,
          privyDid,
          walletAddress: null,
          passwordHash: null,
        },
        select: privyUserSelect,
      });

      return { ok: true, user: toAuthUser(created) };
    }
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      const existing = await getPrisma().user.findUnique({
        where: { privyDid },
        select: privyUserSelect,
      });

      if (existing) {
        return { ok: true, user: toAuthUser(existing) };
      }
    }

    logDatabaseError("privySignIn", error);
    return toAuthUnavailableResult();
  }
}

export async function signOut(): Promise<void> {
  await destroySession();
}
