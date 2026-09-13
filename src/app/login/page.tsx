import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthConfigured } from "@/lib/auth/google";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in — Task2Stock",
  description: "Sign in to Task2Stock to keep task progress with your account.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const session = await getSession();

  if (session) {
    redirect("/tasks");
  }

  const params = await searchParams;
  const googleFailed = params.error === "google";

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-20 pt-16 md:pb-28 md:pt-24">
        <AuthShell
          eyebrow="Account"
          title="Sign in"
          description="Use your email and password to sign in. Completed tasks stay with this account."
        >
          <LoginForm
            googleEnabled={isGoogleOAuthConfigured()}
            notice={
              googleFailed
                ? "Google sign-in did not complete. Try again or use email and password."
                : null
            }
          />
        </AuthShell>
      </section>
    </main>
  );
}
