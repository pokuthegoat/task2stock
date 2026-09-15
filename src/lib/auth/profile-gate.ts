import "server-only";

import { redirect } from "next/navigation";
import {
  PROFILE_PATH,
  PROFILE_SETUP_PATH,
  afterAuthPath,
} from "@/lib/auth/paths";
import { getSession } from "@/lib/auth/session";
import type { Session } from "@/lib/auth/types";

export { PROFILE_PATH, PROFILE_SETUP_PATH, afterAuthPath };

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
