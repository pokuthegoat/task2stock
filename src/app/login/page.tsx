import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in — Task2Stock",
  description: "Sign in to Task2Stock with Phantom or email and password.",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/tasks");
  }

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-20 pt-16 md:pb-28 md:pt-24">
        <AuthShell
          eyebrow="Account"
          title="Welcome back"
          description="Connect Phantom to sign in. Email and password remain available as a fallback."
        >
          <LoginForm />
        </AuthShell>
      </section>
    </main>
  );
}
