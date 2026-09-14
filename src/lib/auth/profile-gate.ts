import "server-only";

import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import type { Session } from "@/lib/auth/types";

export const PROFILE_PATH = "/profile";
export const PROFILE_SETUP_PATH = "/profile/setup";

export function afterAuthPath(user: { username: string | null }) {
  return user.username ? "/tasks" : PROFILE_SETUP_PATH;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireCompleteProfile(): Promise<Session> {
  const session = await requireSession();

  if (!session.user.username) {
    redirect(PROFILE_SETUP_PATH);
  }

  return session;
}

export async function requireUsernameSetup(): Promise<Session> {
  const session = await requireSession();

  if (session.user.username) {
    redirect(PROFILE_PATH);
  }

  return session;
}
