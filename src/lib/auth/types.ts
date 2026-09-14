export type AuthUser = {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  hasPassword: boolean;
};

export type Session = {
  user: AuthUser;
};

export type AuthResult =
  | { ok: true; user: AuthUser }
  | {
      ok: false;
      code:
        | "VALIDATION"
        | "INVALID_CREDENTIALS"
        | "EMAIL_TAKEN"
        | "USERNAME_TAKEN"
        | "COOLDOWN"
        | "UNAVAILABLE";
      message: string;
    };

export type FieldErrors = Partial<
  Record<
    | "name"
    | "username"
    | "displayName"
    | "avatarUrl"
    | "email"
    | "password"
    | "confirmPassword"
    | "currentPassword",
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
