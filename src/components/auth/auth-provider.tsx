"use client";

import { usePrivy } from "@privy-io/react-auth";
import { createContext, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import type { AuthUser } from "@/lib/auth/types";

type AuthContextValue = {
  user: AuthUser | null;
  signOut: () => Promise<void>;
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
  const { logout } = usePrivy();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: initialUser,
      async signOut() {
        try {
          await logout();
        } catch {
          // Privy may already be signed out.
        }
        await signOutAction();
        router.refresh();
      },
    }),
    [initialUser, logout, router],
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
