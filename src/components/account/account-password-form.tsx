"use client";

import { useActionState, useState } from "react";
import { changeAccountPasswordAction } from "@/app/actions/account";
import { AuthField } from "@/components/auth/auth-field";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import type { FieldErrors } from "@/lib/auth/types";
import { initialAuthFormState } from "@/lib/auth/types";

function PasswordFields({ errors }: { errors: FieldErrors }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <>
      <AuthField
        id="current-password"
        name="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={setCurrentPassword}
        error={errors.currentPassword}
      />
      <AuthField
        id="new-password"
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        error={errors.password}
      />
      <AuthField
        id="confirm-new-password"
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={errors.confirmPassword}
      />
    </>
  );
}

export function AccountPasswordForm() {
  const [state, formAction, pending] = useActionState(
    changeAccountPasswordAction,
    initialAuthFormState,
  );

  return (
    <form action={formAction} noValidate className="space-y-5">
      <FormMessage
        message={state.message}
        tone={state.ok ? "success" : "error"}
      />
      <PasswordFields
        key={state.ok ? "cleared" : "idle"}
        errors={state.errors}
      />
      <Button type="submit" disabled={pending}>
        Change password
      </Button>
    </form>
  );
}
