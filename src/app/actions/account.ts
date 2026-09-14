"use server";

import { revalidatePath } from "next/cache";
import {
  changeAccountPassword,
  updateAccountName,
} from "@/lib/auth/provider";
import { getSession, replaceSessionsForUser } from "@/lib/auth/session";
import type { AuthFormState } from "@/lib/auth/types";
import {
  hasFieldErrors,
  validateName,
  validatePasswordChange,
} from "@/lib/auth/validation";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function unauthenticated(): AuthFormState {
  return {
    ok: false,
    errors: {},
    message: "Sign in to manage your account.",
  };
}

export async function updateAccountNameAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await getSession();

  if (!session) {
    return unauthenticated();
  }

  const name = readField(formData, "name");
  const errors = { name: validateName(name) };

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  const result = await updateAccountName({
    userId: session.user.id,
    name,
  });

  if (!result.ok) {
    return { ok: false, errors: {}, message: result.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/account");
  return { ok: true, errors: {}, message: "Name updated." };
}

export async function changeAccountPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await getSession();

  if (!session) {
    return unauthenticated();
  }

  if (!session.user.hasPassword) {
    return {
      ok: false,
      errors: {},
      message: "This account signs in with Google. A local password is not set.",
    };
  }

  const currentPassword = readField(formData, "currentPassword");
  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirmPassword");
  const errors = validatePasswordChange({
    currentPassword,
    password,
    confirmPassword,
  });

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  const result = await changeAccountPassword({
    userId: session.user.id,
    currentPassword,
    newPassword: password,
  });

  if (!result.ok) {
    return { ok: false, errors: {}, message: result.message };
  }

  await replaceSessionsForUser(session.user.id);
  revalidatePath("/", "layout");
  revalidatePath("/account");
  return { ok: true, errors: {}, message: "Password changed." };
}
