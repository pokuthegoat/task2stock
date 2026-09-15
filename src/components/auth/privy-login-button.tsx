"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthMethodDivider } from "@/components/auth/google-continue-button";
import { Button } from "@/components/ui/button";

export function PrivyLoginButton({
  size = "sm",
  className = "",
  label = "Login with Privy",
  variant = "primary",
  compact = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  autoSync?: boolean;
  compact?: boolean;
}) {
  const { ready, pending, error, loginWithPrivy, loginWithWallet } = useAuth();

  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    return compact ? null : (
      <p className="text-sm text-foreground/68">
        Privy is not configured. Add NEXT_PUBLIC_PRIVY_APP_ID to env.
      </p>
    );
  }

  const loginButton = (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={!ready || pending}
      onClick={() => loginWithPrivy()}
    >
      {pending ? "Connecting…" : label}
    </Button>
  );

  if (compact) {
    return loginButton;
  }

  return (
    <div className="grid gap-3">
      {loginButton}
      <AuthMethodDivider />
      <Button
        size={size}
        variant="secondary"
        className={className}
        disabled={!ready || pending}
        onClick={() => loginWithWallet()}
      >
        {pending ? "Connecting…" : "Sign up with wallet"}
      </Button>
      {error ? (
        <p className="text-center text-sm text-red-300/90">{error}</p>
      ) : null}
    </div>
  );
}
