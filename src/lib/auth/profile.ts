import "server-only";

import { cooldownView, type CooldownView } from "@/lib/auth/cooldown";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth/password";
import { toAuthUser } from "@/lib/auth/session";
import type { AuthResult } from "@/lib/auth/types";
import {
  normalizeUsername,
  validateAvatarUrl,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/auth/validation";
import { getPrisma } from "@/lib/data/db/client";
import {
  isDuplicateConstraintError,
  logDatabaseError,
  toAuthUnavailableResult,
} from "@/lib/data/db/errors";

const profileSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  avatarUrl: true,
  passwordHash: true,
  usernameChangedAt: true,
  emailChangedAt: true,
  passwordChangedAt: true,
} as const;

export type ProfileRecord = {
  id: string;
  displayName: string;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  hasPassword: boolean;
  usernameCooldown: CooldownView;
  emailCooldown: CooldownView;
  passwordCooldown: CooldownView;
};

function unavailable(): AuthResult {
  return toAuthUnavailableResult();
}

function validation(message: string): AuthResult {
  return { ok: false, code: "VALIDATION", message };
}

function cooldown(message: string): AuthResult {
  return { ok: false, code: "COOLDOWN", message };
}

function toProfile(user: {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  passwordHash: string | null;
  usernameChangedAt: Date | null;
  emailChangedAt: Date | null;
  passwordChangedAt: Date | null;
}): ProfileRecord {
  return {
    id: user.id,
    displayName: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    hasPassword: Boolean(user.passwordHash),
    usernameCooldown: cooldownView(user.usernameChangedAt, "Username"),
    emailCooldown: cooldownView(user.emailChangedAt, "Email"),
    passwordCooldown: cooldownView(user.passwordChangedAt, "Password"),
  };
}

export async function getProfileByUserId(
  userId: string,
): Promise<ProfileRecord | null> {
  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  return user ? toProfile(user) : null;
}

export async function completeUsernameSetup(input: {
  userId: string;
  username: string;
}): Promise<AuthResult> {
  const usernameError = validateUsername(input.username);
  if (usernameError) return validation(usernameError);

  const username = normalizeUsername(input.username);

  try {
    const user = await getPrisma().user.findUnique({
      where: { id: input.userId },
      select: profileSelect,
    });

    if (!user) {
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Sign in to choose a username.",
      };
    }

    if (user.username) {
      return { ok: true, user: toAuthUser(user) };
    }

    const updated = await getPrisma().user.update({
      where: { id: user.id },
      data: {
        username,
        name: username,
        usernameChangedAt: new Date(),
      },
      select: profileSelect,
    });

    return { ok: true, user: toAuthUser(updated) };
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      return {
        ok: false,
        code: "USERNAME_TAKEN",
        message: "That username is already taken.",
      };
    }

    logDatabaseError("usernameSetup", error);
    return unavailable();
  }
}

export async function updateUsername(input: {
  userId: string;
  username: string;
}): Promise<AuthResult> {
  const usernameError = validateUsername(input.username);
  if (usernameError) return validation(usernameError);

  const username = normalizeUsername(input.username);

  try {
    const user = await getPrisma().user.findUnique({
      where: { id: input.userId },
      select: profileSelect,
    });

    if (!user) {
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Sign in to manage your profile.",
      };
    }

    if (!user.username) {
      return completeUsernameSetup(input);
    }

    if (user.username === username) {
      return { ok: true, user: toAuthUser(user) };
    }

    const status = cooldownView(user.usernameChangedAt, "Username");
    if (!status.availableNow) {
      return cooldown(status.label);
    }

    const updated = await getPrisma().user.update({
      where: { id: user.id },
      data: {
        username,
        usernameChangedAt: new Date(),
      },
      select: profileSelect,
    });

    return { ok: true, user: toAuthUser(updated) };
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      return {
        ok: false,
        code: "USERNAME_TAKEN",
        message: "That username is already taken.",
      };
    }

    logDatabaseError("updateUsername", error);
    return unavailable();
  }
}

export async function updateDisplayName(input: {
  userId: string;
  displayName: string;
}): Promise<AuthResult> {
  const nameError = validateDisplayName(input.displayName);
  if (nameError) return validation(nameError);

  try {
    const updated = await getPrisma().user.update({
      where: { id: input.userId },
      data: { name: input.displayName.trim() },
      select: profileSelect,
    });

    return { ok: true, user: toAuthUser(updated) };
  } catch (error) {
    logDatabaseError("updateDisplayName", error);
    return unavailable();
  }
}

export async function updateAvatarUrl(input: {
  userId: string;
  avatarUrl: string;
}): Promise<AuthResult> {
  const urlError = validateAvatarUrl(input.avatarUrl);
  if (urlError) return validation(urlError);

  try {
    const updated = await getPrisma().user.update({
      where: { id: input.userId },
      data: { avatarUrl: input.avatarUrl.trim() || null },
      select: profileSelect,
    });

    return { ok: true, user: toAuthUser(updated) };
  } catch (error) {
    logDatabaseError("updateAvatarUrl", error);
    return unavailable();
  }
}

export async function updateEmailAddress(input: {
  userId: string;
  email: string;
}): Promise<AuthResult> {
  const emailError = validateEmail(input.email);
  if (emailError) return validation(emailError);

  const email = normalizeEmail(input.email);

  try {
    const user = await getPrisma().user.findUnique({
      where: { id: input.userId },
      select: profileSelect,
    });

    if (!user) {
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Sign in to manage your profile.",
      };
    }

    if (user.email === email) {
      return { ok: true, user: toAuthUser(user) };
    }

    const status = cooldownView(user.emailChangedAt, "Email");
    if (!status.availableNow) {
      return cooldown(status.label);
    }

    const updated = await getPrisma().user.update({
      where: { id: user.id },
      data: {
        email,
        emailChangedAt: new Date(),
      },
      select: profileSelect,
    });

    return { ok: true, user: toAuthUser(updated) };
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      return {
        ok: false,
        code: "EMAIL_TAKEN",
        message: "That email is already in use.",
      };
    }

    logDatabaseError("updateEmail", error);
    return unavailable();
  }
}

export async function updatePassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResult> {
  const passwordError = validatePassword(input.newPassword);
  if (passwordError) return validation(passwordError);

  try {
    const user = await getPrisma().user.findUnique({
      where: { id: input.userId },
      select: profileSelect,
    });

    if (!user) {
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Sign in to manage your profile.",
      };
    }

    const status = cooldownView(user.passwordChangedAt, "Password");
    if (!status.availableNow) {
      return cooldown(status.label);
    }

    if (user.passwordHash) {
      if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
        return {
          ok: false,
          code: "INVALID_CREDENTIALS",
          message: "Current password is incorrect.",
        };
      }
    }

    const updated = await getPrisma().user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(input.newPassword),
        passwordChangedAt: new Date(),
      },
      select: profileSelect,
    });

    return { ok: true, user: toAuthUser(updated) };
  } catch (error) {
    logDatabaseError("updatePassword", error);
    return unavailable();
  }
}
