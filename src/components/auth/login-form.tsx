"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { hasFieldErrors } from "@/lib/auth/validation";
import { signInAction } from "@/app/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { FormMessage } from "@/components/auth/form-message";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/types";

export function LoginForm({
  googleEnabled = false,
  notice: initialNotice = null,
}: {
  googleEnabled?: boolean;
  notice?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialAuthFormState,
  );
  const [notice, setNotice] = useState<string | null>(initialNotice);

  useEffect(() => {
    if (hasFieldErrors(state.errors)) {
      setNotice(null);
      return;
    }
    if (state.message) setNotice(state.message);
  }, [state]);

  return (
    <div className="space-y-5">
      <FormMessage message={notice} />

      <form action={formAction} noValidate className="space-y-5">
        <AuthField
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={state.errors.email}
        />
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={state.errors.password}
        />
        <Button type="submit" disabled={pending} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-white/8" />
        <span className="text-xs text-foreground/35">or</span>
        <span className="h-px flex-1 bg-white/8" />
      </div>

      <GoogleButton enabled={googleEnabled} />

      <p className="text-center text-sm text-foreground/48">
        New here?{" "}
        <Link href="/signup" className="text-foreground hover:text-accent">
          Create an account
        </Link>
      </p>
    </div>
  );
}
