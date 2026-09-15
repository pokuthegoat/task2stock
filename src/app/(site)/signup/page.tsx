import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { afterAuthPath } from "@/lib/auth/profile-gate";
import { getSession } from "@/lib/auth/session";
import { googleAuthErrorMessage } from "@/lib/auth/validation";

export const metadata: Metadata = {
  title: "Create account — Task2Stock",
  description:
    "Create a Task2Stock account with Google or email and password.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();

  if (session) {
    redirect(afterAuthPath(session.user));
  }

  const { error } = await searchParams;

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-20 pt-10 md:pb-28 md:pt-16">
        <AuthShell
          eyebrow="Welcome"
          title="Create your account"
          description="Continue with Google or create an account with email and password."
        >
          <SignupForm notice={googleAuthErrorMessage(error)} />
        </AuthShell>
      </section>
    </main>
  );
}
