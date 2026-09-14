"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { hasFieldErrors } from "@/lib/auth/validation";
import { signUpAction } from "@/app/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { FormMessage } from "@/components/auth/form-message";
import { PhantomConnect } from "@/components/auth/phantom-connect";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/types";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialAuthFormState,
  );
  const notice = hasFieldErrors(state.errors) ? null : state.message;

  return (
    <div className="space-y-5">
      <PhantomConnect />

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-white/8" />
        <span className="text-xs text-foreground/35">or</span>
        <span className="h-px flex-1 bg-white/8" />
      </div>

      <FormMessage message={notice} />

      <form action={formAction} noValidate className="space-y-5">
        <AuthField
          id="name"
          name="name"
          label="Name"
          autoComplete="name"
          value={name}
          onChange={setName}
          error={state.errors.name}
        />
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
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={state.errors.password}
        />
        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={state.errors.confirmPassword}
        />
        <Button type="submit" disabled={pending} className="w-full">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-foreground/48">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
