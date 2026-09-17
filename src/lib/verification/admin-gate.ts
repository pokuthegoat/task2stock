import "server-only";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isVerificationAdmin } from "@/lib/verification/access";

/**
 * Server-only gate for /admin/* pages.
 * Uses VERIFICATION_ADMIN_USER_IDS — same allowlist as manual verification.
 */
export async function requireVerificationAdmin() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isVerificationAdmin(session.user.id)) {
    notFound();
  }

  return session;
}
