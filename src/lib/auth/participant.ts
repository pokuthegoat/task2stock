import "server-only";

import { getSession } from "@/lib/auth/session";

/**
 * Task participation identity is the authenticated User.id.
 * The unsigned t2s_participant cookie is retired. Existing anonymous
 * attempt rows stay in the database and are not linked to accounts.
 */
export async function readParticipantId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}
