"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { hasFieldErrors } from "@/lib/auth/validation";
import { signInAction } from "@/app/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import {
  AuthMethodDivider,
  GoogleContinueButton,
} from "@/components/auth/google-continue-button";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/types";

export function LoginForm({ notice = null }: { notice?: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialAuthFormState,
  );
  const message = hasFieldErrors(state.errors) ? null : state.message ?? notice;

  return (
    <div className="space-y-5">
      <GoogleContinueButton />
      <AuthMethodDivider />
      <FormMessage message={message} />

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
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-foreground/48">
        New here?{" "}
        <Link href="/signup" className="text-foreground hover:text-accent">
          Create account
        </Link>
      </p>
    </div>
  );
}
