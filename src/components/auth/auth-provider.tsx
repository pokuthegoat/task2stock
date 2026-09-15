"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { syncPrivySession } from "@/components/auth/sync-privy-session";
import { afterAuthPath } from "@/lib/auth/paths";
import type { AuthUser } from "@/lib/auth/types";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  pending: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  loginWithPrivy: () => void;
  loginWithWallet: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, ready, authenticated } = usePrivy();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userRef = useRef(initialUser);
  const syncing = useRef(false);
  const provisioned = useRef(false);

  useEffect(() => {
    userRef.current = initialUser;
  }, [initialUser]);

  const finishSession = useCallback(async () => {
    if (userRef.current || provisioned.current || syncing.current) {
      return userRef.current ? afterAuthPath(userRef.current) : null;
    }

    syncing.current = true;
    setPending(true);
    setError(null);

    try {
      const result = await syncPrivySession();

      if (!result.ok) {
        setError(result.error);
        return null;
      }

      provisioned.current = true;

      if (pathname !== result.next) {
        router.replace(result.next);
      }

      router.refresh();
      return result.next;
    } catch {
      setError("Privy login could not be completed. Try again.");
      return null;
    } finally {
      syncing.current = false;
      setPending(false);
    }
  }, [pathname, router]);

  const { login } = useLogin({
    onComplete: () => {
      if (userRef.current) return;
      void finishSession();
    },
    onError: (code) => {
      if (code === "exited_auth_flow") {
        setError("Privy login was cancelled or failed.");
        return;
      }

      if (
        code === "generic_connect_wallet_error" ||
        code === "unknown_connect_wallet_error" ||
        code === "unable_to_sign" ||
        code === "invalid_message"
      ) {
        setError("Could not log in with wallet. Try again, or use email or Google.");
        return;
      }

      setError("Could not complete Privy login. Try connecting again.");
    },
  });

  const loginWithPrivy = useCallback(() => {
    if (userRef.current) {
      router.replace(afterAuthPath(userRef.current));
      return;
    }

    if (authenticated) {
      void finishSession();
      return;
    }

    login();
  }, [authenticated, finishSession, login, router]);

  const loginWithWallet = useCallback(() => {
    if (userRef.current) {
      router.replace(afterAuthPath(userRef.current));
      return;
    }

    if (authenticated) {
      void finishSession();
      return;
    }

    login({
      loginMethods: ["wallet"],
      walletChainType: "ethereum-only",
    });
  }, [authenticated, finishSession, login, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: initialUser,
      ready,
      pending,
      error,
      async signOut() {
        provisioned.current = false;
        try {
          await logout();
        } catch {
          // Privy may already be signed out.
        }
        await signOutAction();
        router.refresh();
      },
      loginWithPrivy,
      loginWithWallet,
    }),
    [
      initialUser,
      ready,
      pending,
      error,
      logout,
      router,
      loginWithPrivy,
      loginWithWallet,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
