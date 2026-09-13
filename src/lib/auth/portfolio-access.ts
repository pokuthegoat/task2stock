import { getSession } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

export type PortfolioViewer =
  | { kind: "preview" }
  | { kind: "user"; user: AuthUser };

/**
 * Example holdings and totals stay fixture-backed.
 * Issued rewards for a signed-in user are loaded separately
 * and never mixed into the Maya/example book.
 */
export async function getPortfolioViewer(): Promise<PortfolioViewer> {
  const session = await getSession();

  if (session?.user) {
    return { kind: "user", user: session.user };
  }

  return { kind: "preview" };
}
