"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAccountNameAction } from "@/app/actions/account";
import { AuthField } from "@/components/auth/auth-field";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/types";

export function AccountNameForm({
  name: initialName,
}: {
  name: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [state, formAction, pending] = useActionState(
    updateAccountNameAction,
    initialAuthFormState,
  );

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state]);

  return (
    <form action={formAction} noValidate className="space-y-5">
      <FormMessage
        message={state.message}
        tone={state.ok ? "success" : "error"}
      />
      <AuthField
        id="account-name"
        name="name"
        label="Name"
        autoComplete="name"
        value={name}
        onChange={setName}
        error={state.errors.name}
      />
      <Button type="submit" disabled={pending}>
        Save name
      </Button>
    </form>
  );
}
