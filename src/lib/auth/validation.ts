import type { FieldErrors } from "@/lib/auth/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Enter your name.";
  if (name.length < 2) return "Name must be at least 2 characters.";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email.";
  if (!emailPattern.test(email)) return "Enter a valid email address.";
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
}): FieldErrors {
  return {
    currentPassword: validateCurrentPassword(input.currentPassword),
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
