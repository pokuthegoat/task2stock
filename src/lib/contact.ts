import { validateEmail, validateName } from "@/lib/auth/validation";

export type ContactFieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export const TASK2STOCK_CONTACT_EMAIL = "task2stock@gmail.com";

export function readContactEmail(
  value = process.env.NEXT_PUBLIC_CONTACT_EMAIL,
): string | null {
  const email = value?.trim() || TASK2STOCK_CONTACT_EMAIL;

  if (validateEmail(email)) {
    return null;
  }

  return email;
}

export function validateContactForm(input: {
  name: string;
  email: string;
  message: string;
}): ContactFieldErrors {
  const message = input.message.trim();

  return {
    name: validateName(input.name),
    email: validateEmail(input.email),
    message: !message
      ? "Enter a message."
      : message.length < 10
        ? "Message must be at least 10 characters."
        : undefined,
  };
}

export function buildContactMailto(input: {
  recipient: string;
  name: string;
  email: string;
  message: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  const subject = `Task2Stock contact from ${name}`;
  const body = `${message}\n\n—\n${name}\n${email}`;

  return `mailto:${input.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function hasContactFieldErrors(errors: ContactFieldErrors) {
  return Object.values(errors).some(Boolean);
}
