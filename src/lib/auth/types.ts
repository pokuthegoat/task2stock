export type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  hasPassword: boolean;
};

export type Session = {
  user: AuthUser;
};

export type AuthResult =
  | { ok: true; user: AuthUser }
  | {
      ok: false;
      code: "VALIDATION" | "INVALID_CREDENTIALS" | "EMAIL_TAKEN" | "UNAVAILABLE";
      message: string;
    };

export type FieldErrors = Partial<
  Record<
    "name" | "email" | "password" | "confirmPassword" | "currentPassword",
    string
  >
>;

export type AuthFormState = {
  ok: boolean;
  errors: FieldErrors;
  message: string | null;
};

export const initialAuthFormState: AuthFormState = {
  ok: false,
  errors: {},
  message: null,
};
