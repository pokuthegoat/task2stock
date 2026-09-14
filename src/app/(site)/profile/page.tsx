import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  updateAvatarUrlAction,
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
      <section className="pt-16 pb-10 md:pt-24 md:pb-12">
        <PageContainer>
          <SectionHeading
            as="h1"
            eyebrow="Profile"
            title="Profile"
            description="Your public profile and account settings for this Task2Stock session."
          />
        </PageContainer>
      </section>

      <section className="pb-28">
        <PageContainer className="grid max-w-2xl gap-16">
          <div className="border-t border-white/8 pt-8">
            <ProfileAvatar
              name={profile.displayName}
              username={profile.username}
              avatarUrl={profile.avatarUrl}
            />
            <h2 className="heading mt-6 text-3xl text-foreground">
              {profile.displayName}
            </h2>
            <p className="mt-2 text-sm text-foreground/58">@{profile.username}</p>
          </div>

          <div className="border-t border-white/8 pt-8">
            <p className="label">Profile information</p>
            <h2 className="heading mt-3 text-3xl text-foreground">
              Edit profile
            </h2>
            <div className="mt-8 space-y-12">
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
              <div>
                <p className="label">Profile picture</p>
                <p className="mt-3 text-sm leading-6 text-foreground/58">
                  Paste an https image URL. Leave it empty to use the fallback
                  avatar.
                </p>
                <div className="mt-6">
                  <ProfileTextForm
                    key={`avatar-${profile.avatarUrl ?? "none"}`}
                    action={updateAvatarUrlAction}
                    field="avatarUrl"
                    label="Image URL"
                    type="url"
                    initialValue={profile.avatarUrl ?? ""}
                    submitLabel="Save picture"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 pt-8">
            <p className="label">Account & security</p>
            <h2 className="heading mt-3 text-3xl text-foreground">
              Email and password
            </h2>
            <div className="mt-8 space-y-12">
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
        </PageContainer>
      </section>
    </main>
  );
}
