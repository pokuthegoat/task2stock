import "server-only";

import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { createSession } from "@/lib/auth/session";
import type { AuthResult, AuthUser } from "@/lib/auth/types";
import {
  WALLET_AUTH_TTL_MS,
  buildWalletAuthMessage,
  walletDisplayName,
} from "@/lib/auth/wallet-message";
import {
  decodeSolanaAddress,
  encodeSolanaAddress,
  evaluateWalletChallenge,
} from "@/lib/auth/wallet-verify";
import { getPrisma } from "@/lib/data/db/client";

export function toAuthUser(user: {
  id: string;
  name: string;
  email: string | null;
  walletAddress: string | null;
  passwordHash?: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress,
    hasPassword: Boolean(user.passwordHash),
  };
}

export async function beginWalletAuth(walletAddress: string) {
  const publicKey = decodeSolanaAddress(walletAddress);

  if (!publicKey) {
    return { ok: false as const, error: "Connect a valid Solana wallet." };
  }

  const address = encodeSolanaAddress(publicKey);
  const nonce = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + WALLET_AUTH_TTL_MS);
  const message = buildWalletAuthMessage({
    walletAddress: address,
    nonce,
    expiresAt,
  });
  const id = crypto.randomUUID();

  await getPrisma().walletAuthChallenge.create({
    data: {
      id,
      nonce,
      walletAddress: address,
      message,
      expiresAt,
    },
  });

  return {
    ok: true as const,
    challengeId: id,
    message,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function completeWalletAuth(input: {
  challengeId: string;
  publicKey: string;
  signature: string;
}): Promise<AuthResult> {
  const prisma = getPrisma();

  try {
    const user = await prisma.$transaction(async (tx) => {
      const challenge = await tx.walletAuthChallenge.findUnique({
        where: { id: input.challengeId },
      });
      const checked = evaluateWalletChallenge(challenge, {
        publicKey: input.publicKey,
        signature: input.signature,
      });

      if (!checked.ok || !challenge) {
        throw new WalletAuthError(checked.ok ? "The wallet signature is not valid." : checked.error);
      }

      const consumed = await tx.walletAuthChallenge.updateMany({
        where: {
          id: challenge.id,
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { consumedAt: new Date() },
      });

      if (consumed.count !== 1) {
        throw new WalletAuthError("This sign-in request was already used.");
      }

      const existing = await tx.user.findUnique({
        where: { walletAddress: checked.walletAddress },
        select: {
          id: true,
          name: true,
          email: true,
          walletAddress: true,
          passwordHash: true,
        },
      });

      if (existing) {
        return existing;
      }

      try {
        return await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            name: walletDisplayName(checked.walletAddress),
            email: null,
            passwordHash: null,
            walletAddress: checked.walletAddress,
          },
          select: {
            id: true,
            name: true,
            email: true,
            walletAddress: true,
            passwordHash: true,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const raced = await tx.user.findUnique({
            where: { walletAddress: checked.walletAddress },
            select: {
              id: true,
              name: true,
              email: true,
              walletAddress: true,
              passwordHash: true,
            },
          });

          if (raced) return raced;
        }

        throw error;
      }
    });

    await createSession(user.id);
    return { ok: true, user: toAuthUser(user) };
  } catch (error) {
    if (error instanceof WalletAuthError) {
      return { ok: false, code: "WALLET", message: error.message };
    }

    throw error;
  }
}

class WalletAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletAuthError";
  }
}
