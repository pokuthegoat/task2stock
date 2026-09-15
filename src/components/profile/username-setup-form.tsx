"use client";

import { useActionState, useState } from "react";
import { completeUsernameSetupAction } from "@/app/actions/profile";
import { AuthField } from "@/components/auth/auth-field";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/types";

export function UsernameSetupForm() {
  const [username, setUsername] = useState("");
  const [state, formAction, pending] = useActionState(
    completeUsernameSetupAction,
    initialAuthFormState,
  );

  return (
    <form action={formAction} noValidate className="space-y-5">
      <FormMessage message={state.message} />
      <AuthField
        id="setup-username"
        name="username"
        label="Username"
        autoComplete="username"
        value={username}
        onChange={setUsername}
        error={state.errors.username}
        hint="3–20 characters. Start with a letter. Letters, numbers, and underscores only."
        placeholder="josh"
      />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        Continue
      </Button>
    </form>
  );
}
