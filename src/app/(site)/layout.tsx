import { redirect } from "next/navigation";
import { PROFILE_SETUP_PATH } from "@/lib/auth/profile-gate";
import { getSession } from "@/lib/auth/session";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session && !session.user.username) {
    redirect(PROFILE_SETUP_PATH);
  }

  return children;
}
