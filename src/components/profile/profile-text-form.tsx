"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthField } from "@/components/auth/auth-field";
import { FormMessage } from "@/components/auth/form-message";
import { CooldownNote } from "@/components/profile/cooldown-note";
import { Button } from "@/components/ui/button";
import type { CooldownView } from "@/lib/auth/cooldown";
import { initialAuthFormState, type AuthFormState } from "@/lib/auth/types";

export function ProfileTextForm({
  action,
  field,
  label,
  type = "text",
  autoComplete,
  initialValue,
  cooldown,
  successRefresh = true,
  submitLabel,
  hint,
  placeholder,
}: {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  field: "username" | "displayName" | "avatarUrl" | "email";
  label: string;
  type?: "text" | "email" | "url";
  autoComplete?: string;
  initialValue: string;
  cooldown?: CooldownView;
  successRefresh?: boolean;
  submitLabel: string;
  hint?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const locked = cooldown ? !cooldown.availableNow : false;
  const [state, formAction, pending] = useActionState(
    action,
    initialAuthFormState,
  );

  useEffect(() => {
    if (state.ok && successRefresh) {
      router.refresh();
    }
  }, [router, state.ok, successRefresh]);

  return (
    <form action={formAction} noValidate className="space-y-5">
      <FormMessage
        message={state.message}
        tone={state.ok ? "success" : "error"}
      />
      <AuthField
        id={`profile-${field}`}
        name={field}
        label={label}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={setValue}
        error={state.errors[field]}
        hint={hint}
        placeholder={placeholder}
        disabled={locked}
      />
      {cooldown ? <CooldownNote cooldown={cooldown} /> : null}
      <Button type="submit" disabled={pending || locked}>
        {submitLabel}
      </Button>
    </form>
  );
}
