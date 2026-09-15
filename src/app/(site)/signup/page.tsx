import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { PrivyLoginButton } from "@/components/auth/privy-login-button";
import { afterAuthPath } from "@/lib/auth/profile-gate";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Login with Privy — Task2Stock",
  description: "Create a Task2Stock session with Privy. Payments go through your Privy wallet, not Task2Stock.",
};

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect(afterAuthPath(session.user));
  }

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-20 pt-10 md:pb-28 md:pt-16">
        <AuthShell
          eyebrow="Welcome"
          title="Login with Privy"
          description="Privy creates your account and wallet. Task2Stock never holds or routes payments."
        >
          <PrivyLoginButton size="lg" className="w-full" autoSync />
        </AuthShell>
      </section>
    </main>
  );
}
