"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  completeUsernameSetup,
  updateAvatarUrl,
  updateDisplayName,
  updateEmailAddress,
  updatePassword,
  updateUsername,
} from "@/lib/auth/profile";
import {
  PROFILE_PATH,
  PROFILE_SETUP_PATH,
} from "@/lib/auth/profile-gate";
import { getSession, replaceSessionsForUser } from "@/lib/auth/session";
import type { AuthFormState } from "@/lib/auth/types";
import {
  hasFieldErrors,
  validateAvatarUrl,
  validateDisplayName,
  validateEmail,
  validatePasswordChange,
  validateUsername,
} from "@/lib/auth/validation";
import { inspectOwnedBlob } from "@/lib/storage/blob";
import {
  blobUrlAccess,
  isProfileBlobConfigured,
} from "@/lib/storage/blob-env";

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function unauthenticated(): AuthFormState {
  return {
    ok: false,
    errors: {},
    message: "Sign in to manage your profile.",
  };
}

async function requireProfileSession() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  if (!session.user.username) {
    redirect(PROFILE_SETUP_PATH);
  }

  return session;
}

function fromResult(
  result: { ok: true } | { ok: false; message: string },
  success: string,
): AuthFormState {
  if (!result.ok) {
    return { ok: false, errors: {}, message: result.message };
  }

  revalidatePath("/", "layout");
  revalidatePath(PROFILE_PATH);
  return { ok: true, errors: {}, message: success };
}

export async function completeUsernameSetupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await getSession();

  if (!session) {
    return unauthenticated();
  }

  if (session.user.username) {
    redirect(PROFILE_PATH);
  }

  const username = readField(formData, "username");
  const errors = { username: validateUsername(username) };

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  const result = await completeUsernameSetup({
    userId: session.user.id,
    username,
  });

  if (!result.ok) {
    return { ok: false, errors: {}, message: result.message };
  }

  revalidatePath("/", "layout");
  redirect("/tasks");
}

export async function updateUsernameAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireProfileSession();

  if (!session) {
    return unauthenticated();
  }

  const username = readField(formData, "username");
  const errors = { username: validateUsername(username) };

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  return fromResult(
    await updateUsername({ userId: session.user.id, username }),
    "Username updated.",
  );
}

export async function updateDisplayNameAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireProfileSession();

  if (!session) {
    return unauthenticated();
  }

  const displayName = readField(formData, "displayName");
  const errors = { displayName: validateDisplayName(displayName) };

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  return fromResult(
    await updateDisplayName({ userId: session.user.id, displayName }),
    "Display name updated.",
  );
}

export async function updateAvatarUrlAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireProfileSession();

  if (!session) {
    return unauthenticated();
  }

  const avatarUrl = readField(formData, "avatarUrl");
  const errors = { avatarUrl: validateAvatarUrl(avatarUrl) };

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  const trimmed = avatarUrl.trim();

  if (
    trimmed &&
    blobUrlAccess(trimmed) === "public" &&
    isProfileBlobConfigured()
  ) {
    const owned = await inspectOwnedBlob({
      userId: session.user.id,
      url: trimmed,
      kind: "avatar",
    });

    if (!owned) {
      return {
        ok: false,
        errors: {
          avatarUrl: "Unable to save that image.",
        },
        message: null,
      };
    }

    return fromResult(
      await updateAvatarUrl({ userId: session.user.id, avatarUrl: owned.url }),
      "Profile picture updated.",
    );
  }

  return fromResult(
    await updateAvatarUrl({ userId: session.user.id, avatarUrl }),
    trimmed ? "Profile picture updated." : "Profile picture removed.",
  );
}

export async function updateEmailAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireProfileSession();

  if (!session) {
    return unauthenticated();
  }

  const email = readField(formData, "email");
  const errors = { email: validateEmail(email) };

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  return fromResult(
    await updateEmailAddress({ userId: session.user.id, email }),
    "Email updated.",
  );
}

export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireProfileSession();

  if (!session) {
    return unauthenticated();
  }

  const currentPassword = readField(formData, "currentPassword");
  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirmPassword");
  const errors = validatePasswordChange({
    currentPassword,
    password,
    confirmPassword,
    requireCurrent: session.user.hasPassword,
  });

  if (hasFieldErrors(errors)) {
    return { ok: false, errors, message: null };
  }

  const result = await updatePassword({
    userId: session.user.id,
    currentPassword,
    newPassword: password,
  });

  if (!result.ok) {
    return { ok: false, errors: {}, message: result.message };
  }

  await replaceSessionsForUser(session.user.id);
  revalidatePath("/", "layout");
  revalidatePath(PROFILE_PATH);
  return {
    ok: true,
    errors: {},
    message: session.user.hasPassword ? "Password changed." : "Password set.",
  };
}
