import { Prisma } from "@prisma/client";
import type { AuthResult } from "@/lib/auth/types";

const UNAVAILABLE_MESSAGE = "Unable to sign in right now.";

export function logDatabaseError(scope: string, error: unknown) {
  console.error(`[task2stock:${scope}]`, error);
}

export function toAuthUnavailableResult(): Extract<AuthResult, { ok: false }> {
  return {
    ok: false,
    code: "UNAVAILABLE",
    message: UNAVAILABLE_MESSAGE,
  };
}

export function isDuplicateConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}
