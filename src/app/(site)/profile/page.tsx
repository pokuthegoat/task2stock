import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  updateDisplayNameAction,
  updateEmailAction,
  updateUsernameAction,
} from "@/app/actions/profile";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ProfilePasswordForm } from "@/components/profile/profile-password-form";
import { ProfileTextForm } from "@/components/profile/profile-text-form";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProfileByUserId } from "@/lib/auth/profile";
import {
  PROFILE_SETUP_PATH,
  requireCompleteProfile,
} from "@/lib/auth/profile-gate";

export const metadata: Metadata = {
  title: "Profile — Task2Stock",
  description: "View and update your Task2Stock profile.",
};

export default async function ProfilePage() {
  const session = await requireCompleteProfile();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile?.username) {
    redirect(PROFILE_SETUP_PATH);
  }

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-20 pt-10 md:pb-28 md:pt-14">
        <PageContainer>
          <div className="mx-auto grid w-full max-w-2xl gap-6">
            <SectionHeading
              as="h1"
              align="center"
              eyebrow="Profile"
              title="Profile"
              description="Your public profile and account settings for this Task2Stock session."
              className="mb-4"
            />

            <div className="glass-panel p-7 md:p-10">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 sm:text-left">
                <div className="shrink-0">
                  <ProfileAvatar
                    name={profile.displayName}
                    username={profile.username}
                    avatarUrl={profile.avatarUrl}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="heading text-3xl text-foreground">
                    {profile.displayName}
                  </h2>
                  <p className="mt-2 text-sm text-foreground/70">
                    @{profile.username}
                  </p>
                </div>
              </div>

              <hr className="hairline my-9" />

              <div className="space-y-10">
                <ProfileTextForm
                  key={`username-${profile.username}`}
                  action={updateUsernameAction}
                  field="username"
                  label="Username"
                  autoComplete="username"
                  initialValue={profile.username}
                  cooldown={profile.usernameCooldown}
                  submitLabel="Change username"
                  hint="3–20 characters. Letters, numbers, and underscores."
                />
                <ProfileTextForm
                  key={`name-${profile.displayName}`}
                  action={updateDisplayNameAction}
                  field="displayName"
                  label="Display name"
                  autoComplete="nickname"
                  initialValue={profile.displayName}
                  submitLabel="Save display name"
                />
              </div>
            </div>

            <div className="glass-panel p-7 md:p-10">
              <p className="label">Account &amp; security</p>
              <h2 className="heading mt-3 text-3xl text-foreground">
                Email and password
              </h2>
              <hr className="hairline my-9" />
              <div className="space-y-10">
                <ProfileTextForm
                  key={`email-${profile.email ?? "none"}`}
                  action={updateEmailAction}
                  field="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  initialValue={profile.email ?? ""}
                  cooldown={profile.emailCooldown}
                  submitLabel="Change email"
                />
                <ProfilePasswordForm
                  hasPassword={profile.hasPassword}
                  cooldown={profile.passwordCooldown}
                />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
