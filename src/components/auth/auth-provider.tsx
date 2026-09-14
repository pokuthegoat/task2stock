"use client";

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

  const value = useMemo<AuthContextValue>(
    () => ({
      user: initialUser,
      async signOut() {
        await signOutAction();
        router.refresh();
      },
    }),
    [initialUser, router],
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
