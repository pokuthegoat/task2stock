"use client";

import { useEffect, useRef, useState } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { completePrivySessionAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function PrivyLoginButton({
  size = "sm",
  className = "",
  label = "Login with Privy",
  variant = "primary",
  autoSync = false,
  compact = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  autoSync?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncing = useRef(false);
  const autoSynced = useRef(false);

  async function syncSession() {
    if (syncing.current) return;
    syncing.current = true;
    setPending(true);
    setError(null);

    try {
      const token = await getAccessToken();

      if (!token) {
        setError("Privy did not return a session token.");
        return;
      }

      const result = await completePrivySessionAction(token);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.replace(result.next);
      router.refresh();
    } catch {
      setError("Privy login could not be completed. Try again.");
    } finally {
      syncing.current = false;
      setPending(false);
    }
  }

  const { login } = useLogin({
    onComplete: () => {
      void syncSession();
    },
    onError: () => {
      setError("Privy login was cancelled or failed.");
    },
  });

  useEffect(() => {
    if (!autoSync || !ready || !authenticated || autoSynced.current) {
      return;
    }

    autoSynced.current = true;
    void syncSession();
  }, [autoSync, ready, authenticated]);

  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    return compact ? null : (
      <p className="text-sm text-foreground/68">
        Privy is not configured. Add NEXT_PUBLIC_PRIVY_APP_ID to env.
      </p>
    );
  }

  const button = (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={!ready || pending}
      onClick={() => {
        if (authenticated) {
          void syncSession();
          return;
        }

        login();
      }}
    >
      {pending ? "Connecting…" : label}
    </Button>
  );

  if (compact) {
    return button;
  }

  return (
    <div className="grid gap-3">
      {button}
      {error ? (
        <p className="text-center text-sm text-red-300/90">{error}</p>
      ) : null}
    </div>
  );
}
