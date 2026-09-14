import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account — Task2Stock",
  description:
    "Create a Task2Stock account with Phantom or email and password.",
};

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect("/tasks");
  }

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-20 pt-16 md:pb-28 md:pt-24">
        <AuthShell
          eyebrow="Account"
          title="Create an account"
          description="Connect Phantom to create your account. Email and password remain available as a fallback."
        >
          <SignupForm />
        </AuthShell>
      </section>
    </main>
  );
}
