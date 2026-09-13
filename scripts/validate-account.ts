import {
  hasFieldErrors,
  validateName,
  validatePassword,
  validatePasswordChange,
} from "../src/lib/auth/validation";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(validateName("") === "Enter your name.", "Empty name.");
  assert(validateName("A") === "Name must be at least 2 characters.", "Short name.");
  assert(validateName("  Poku  ") === undefined, "Trimmed name is valid.");

  assert(validatePassword("short") === "Password must be at least 8 characters.", "Short password.");

  const mismatch = validatePasswordChange({
    currentPassword: "old-pass-1",
    password: "new-pass-1",
    confirmPassword: "new-pass-2",
  });
  assert(mismatch.confirmPassword === "Passwords do not match.", "Mismatch.");

  const missingCurrent = validatePasswordChange({
    currentPassword: "",
    password: "new-pass-1",
    confirmPassword: "new-pass-1",
  });
  assert(
    missingCurrent.currentPassword === "Enter your current password.",
    "Current password required.",
  );

  const valid = validatePasswordChange({
    currentPassword: "old-pass-1",
    password: "new-pass-1",
    confirmPassword: "new-pass-1",
  });
  assert(!hasFieldErrors(valid), "Matching passwords should pass field checks.");

  console.log("validate-account: ok");
}

main();
