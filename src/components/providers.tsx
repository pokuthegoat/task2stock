"use client";

import { AppPrivyProvider } from "@/components/auth/privy-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import type { AuthUser } from "@/lib/auth/types";

export function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}) {
  return (
    <AppPrivyProvider>
      <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
    </AppPrivyProvider>
  );
}
