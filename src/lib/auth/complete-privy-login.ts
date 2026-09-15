import "server-only";

import { afterAuthPath } from "@/lib/auth/paths";
import {
  isPrivyConfigured,
  verifyPrivyTokens,
} from "@/lib/auth/privy";
import { findOrCreatePrivyUser } from "@/lib/auth/provider";
import { rotateSessionToken } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

export type PrivyLoginSuccess = {
  ok: true;
  user: AuthUser;
  next: string;
  token: string;
  expiresAt: Date;
};

export type PrivyLoginFailure = {
  ok: false;
  error: string;
};

export async function completePrivyLogin(input: {
  accessToken?: string | null;
  identityToken?: string | null;
}): Promise<PrivyLoginSuccess | PrivyLoginFailure> {
  if (!isPrivyConfigured()) {
    console.error(
      "[task2stock:privy] server is missing NEXT_PUBLIC_PRIVY_APP_ID or PRIVY_APP_SECRET",
    );
    return {
      ok: false,
      error: "Privy login could not be verified. Try again.",
    };
  }

  try {
    const identity = await verifyPrivyTokens(input);
    const result = await findOrCreatePrivyUser(identity);

    if (!result.ok) {
      return { ok: false, error: result.message };
    }

    const session = await rotateSessionToken(result.user.id);

    return {
      ok: true,
      user: result.user,
      next: afterAuthPath(result.user),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error("[task2stock:privy] session complete failed", error);
    return {
      ok: false,
      error: "Privy login could not be verified. Try again.",
    };
  }
}
