"use client";

import { useActionState, useEffect, useState } from "react";
import { changeAccountPasswordAction } from "@/app/actions/account";
import { AuthField } from "@/components/auth/auth-field";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/types";

export function AccountPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    changeAccountPasswordAction,
    initialAuthFormState,
  );

  useEffect(() => {
    if (state.ok) {
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [state]);

  return (
    <form action={formAction} noValidate className="space-y-5">
      <FormMessage
        message={state.message}
        tone={state.ok ? "success" : "error"}
      />
      <AuthField
        id="current-password"
        name="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={setCurrentPassword}
        error={state.errors.currentPassword}
      />
      <AuthField
        id="new-password"
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        error={state.errors.password}
      />
      <AuthField
        id="confirm-new-password"
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={state.errors.confirmPassword}
      />
      <Button type="submit" disabled={pending}>
        Change password
      </Button>
    </form>
  );
}
