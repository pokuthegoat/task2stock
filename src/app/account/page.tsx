import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNameForm } from "@/components/account/account-name-form";
import { AccountPasswordForm } from "@/components/account/account-password-form";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Account — Task2Stock",
  description: "View and update your Task2Stock account.",
};

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main id="main" className="section-base flex-1">
      <section className="pt-16 pb-10 md:pt-24 md:pb-12">
        <PageContainer>
          <SectionHeading
            as="h1"
            eyebrow="Account"
            title="Account"
            description="The signed-in Task2Stock account for this session."
          />
        </PageContainer>
      </section>

      <section className="pb-28">
        <PageContainer className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="border-t border-white/8 pt-8">
            <p className="label">Profile</p>
            <h2 className="heading mt-3 text-3xl text-foreground">
              Name and email
            </h2>
            <p className="mt-4 text-sm leading-6 text-foreground/58">
              Email stays with this account. You can update the name shown in
              the app.
            </p>
            {session.user.email ? (
              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="label">Email</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {session.user.email}
                </p>
              </div>
            ) : null}
            <div className="mt-6">
              <AccountNameForm key={session.user.name} name={session.user.name} />
            </div>
          </div>

          <div className="border-t border-white/8 pt-8">
            <p className="label">Security</p>
            {session.user.hasPassword ? (
              <>
                <h2 className="heading mt-3 text-3xl text-foreground">
                  Password
                </h2>
                <p className="mt-4 text-sm leading-6 text-foreground/58">
                  Enter your current password, then choose a new one.
                </p>
                <div className="mt-6">
                  <AccountPasswordForm />
                </div>
              </>
            ) : (
              <>
                <h2 className="heading mt-3 text-3xl text-foreground">
                  Google
                </h2>
                <p className="mt-4 text-sm leading-6 text-foreground/58">
                  This account signs in with Google. A local password is not
                  set.
                </p>
              </>
            )}
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
