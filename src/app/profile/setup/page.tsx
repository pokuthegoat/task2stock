import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { UsernameSetupForm } from "@/components/profile/username-setup-form";
import { requireUsernameSetup } from "@/lib/auth/profile-gate";

export const metadata: Metadata = {
  title: "Choose a username — Task2Stock",
  description: "Choose a username to finish setting up your Task2Stock profile.",
};

export default async function UsernameSetupPage() {
  await requireUsernameSetup();

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-20 pt-16 md:pb-28 md:pt-24">
        <AuthShell
          eyebrow="Profile"
          title="Choose a username"
          description="A username is required before you can use Task2Stock. Your display name will be set to the same username. You can change the display name later."
        >
          <UsernameSetupForm />
        </AuthShell>
      </section>
    </main>
  );
}
