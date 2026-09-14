import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";
import { googleAuthErrorMessage } from "@/lib/auth/validation";

export const metadata: Metadata = {
  title: "Sign in — Task2Stock",
  description: "Sign in to Task2Stock with Google or email and password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();

  if (session) {
    redirect("/tasks");
  }

  const { error } = await searchParams;

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-20 pt-16 md:pb-28 md:pt-24">
        <AuthShell
          eyebrow="Account"
          title="Welcome back"
          description="Continue with Google or sign in with your email and password."
        >
          <LoginForm notice={googleAuthErrorMessage(error)} />
        </AuthShell>
      </section>
    </main>
  );
}
