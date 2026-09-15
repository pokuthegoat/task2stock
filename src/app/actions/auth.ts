"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { afterAuthPath } from "@/lib/auth/profile-gate";
import { verifyPrivyAccessToken } from "@/lib/auth/privy";
import {
  findOrCreatePrivyUser,
  signInWithPassword,
  signOut as clearSession,
  signUpWithPassword,
} from "@/lib/auth/provider";
import { replaceSessionsForUser } from "@/lib/auth/session";
import type { AuthFormState } from "@/lib/auth/types";
import {
  hasFieldErrors,
  validateLogin,
  validateSignup,
} from "@/lib/auth/validation";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readField(formData, "email");
  const password = readField(formData, "password");
  const errors = validateLogin({ email, password });

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  const result = await signInWithPassword({ email, password });

  if (!result.ok) {
    return { ok: false, errors: {}, message: result.message };
  }

  revalidatePath("/", "layout");
  redirect(afterAuthPath(result.user));
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = readField(formData, "name");
  const email = readField(formData, "email");
  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirmPassword");
  const errors = validateSignup({ name, email, password, confirmPassword });

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  const result = await signUpWithPassword({ name, email, password });

  if (!result.ok) {
    return { ok: false, errors: {}, message: result.message };
  }

  revalidatePath("/", "layout");
  redirect(afterAuthPath(result.user));
}

export async function signOutAction() {
  await clearSession();
  revalidatePath("/", "layout");
}

export async function completePrivySessionAction(accessToken: string) {
  try {
    const identity = await verifyPrivyAccessToken(accessToken);
    const result = await findOrCreatePrivyUser(identity);

    if (!result.ok) {
      return { ok: false as const, error: result.message };
    }

    await replaceSessionsForUser(result.user.id);
    revalidatePath("/", "layout");
    return { ok: true as const, next: afterAuthPath(result.user) };
  } catch {
    return {
      ok: false as const,
      error: "Privy login could not be verified. Try again.",
    };
  }
}
