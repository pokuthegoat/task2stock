"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/app/actions/profile";
import { AuthField } from "@/components/auth/auth-field";
import { FormMessage } from "@/components/auth/form-message";
import { CooldownNote } from "@/components/profile/cooldown-note";
import { Button } from "@/components/ui/button";
import type { CooldownView } from "@/lib/auth/cooldown";
import { initialAuthFormState } from "@/lib/auth/types";

function PasswordFields({
  hasPassword,
  locked,
  errors,
}: {
  hasPassword: boolean;
  locked: boolean;
  errors: {
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
  };
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <>
      {hasPassword ? (
        <AuthField
          id="current-password"
          name="currentPassword"
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          error={errors.currentPassword}
          disabled={locked}
        />
      ) : (
        <p className="text-sm leading-6 text-foreground/58">
          This profile signs in with Google. You can set a local password
          without entering a current one.
        </p>
      )}
      <AuthField
        id="new-password"
        name="password"
        label={hasPassword ? "New password" : "Password"}
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        disabled={locked}
      />
      <AuthField
        id="confirm-new-password"
        name="confirmPassword"
        label={hasPassword ? "Confirm new password" : "Confirm password"}
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={errors.confirmPassword}
        disabled={locked}
      />
    </>
  );
}

export function ProfilePasswordForm({
  hasPassword,
  cooldown,
}: {
  hasPassword: boolean;
  cooldown: CooldownView;
}) {
  const router = useRouter();
  const locked = !cooldown.availableNow;
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialAuthFormState,
  );

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form action={formAction} noValidate className="space-y-5">
      <FormMessage
        message={state.message}
        tone={state.ok ? "success" : "error"}
      />
      <PasswordFields
        key={state.ok ? (state.message ?? "saved") : "edit"}
        hasPassword={hasPassword}
        locked={locked}
        errors={state.errors}
      />
      <CooldownNote cooldown={cooldown} />
      <Button type="submit" disabled={pending || locked}>
        {hasPassword ? "Change password" : "Set password"}
      </Button>
    </form>
  );
}
