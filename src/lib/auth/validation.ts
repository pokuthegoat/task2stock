import type { FieldErrors } from "@/lib/auth/types";

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Enter your name.";
  if (name.length < 2) return "Name must be at least 2 characters.";
  if (name.length > 40) return "Name must be at most 40 characters.";
  return undefined;
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function validateUsername(value: string): string | undefined {
  const username = normalizeUsername(value);

  if (!username) return "Enter a username.";
  if (username.length < 3) return "Username must be at least 3 characters.";
  if (username.length > 20) return "Username must be at most 20 characters.";
  if (!/^[a-z][a-z0-9_]*$/.test(username)) {
    return "Use a letter, then letters, numbers, or underscores.";
  }

  return undefined;
}

export function validateDisplayName(value: string): string | undefined {
  return validateName(value);
}

export function validateAvatarUrl(value: string): string | undefined {
  const url = value.trim();

  if (!url) return undefined;
  if (url.length > 500) return "Image URL must be at most 500 characters.";

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return "Use an https image URL.";
    }
    if (
      parsed.hostname.toLowerCase().endsWith(".private.blob.vercel-storage.com")
    ) {
      return "Proof files cannot be used as a profile picture.";
    }
  } catch {
    return "Enter a valid image URL.";
  }

  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Enter a password.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

export function validatePasswordConfirm(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) return "Confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return undefined;
}

export function validateLogin(input: {
  email: string;
  password: string;
}): FieldErrors {
  return {
    email: validateEmail(input.email),
    password: validatePassword(input.password),
  };
}

export function validateCurrentPassword(value: string): string | undefined {
  if (!value) return "Enter your current password.";
  return undefined;
}

export function validatePasswordChange(input: {
  currentPassword: string;
  password: string;
  confirmPassword: string;
  requireCurrent?: boolean;
}): FieldErrors {
  return {
    currentPassword:
      input.requireCurrent === false
        ? undefined
        : validateCurrentPassword(input.currentPassword),
    password: validatePassword(input.password),
    confirmPassword: validatePasswordConfirm(
      input.password,
      input.confirmPassword,
    ),
  };
}

export function validateSignup(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  return {
    name: validateName(input.name),
    email: validateEmail(input.email),
    password: validatePassword(input.password),
    confirmPassword: validatePasswordConfirm(
      input.password,
      input.confirmPassword,
    ),
  };
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function googleAuthErrorMessage(code: string | undefined) {
  switch (code) {
    case "google_cancelled":
      return "Google sign-in was cancelled.";
    case "google_unavailable":
      return "Google sign-in is not configured.";
    case "google_email":
      return "Google did not provide a verified email address.";
    case "google_failed":
      return "Google sign-in failed. Try again.";
    default:
      return null;
  }
}
