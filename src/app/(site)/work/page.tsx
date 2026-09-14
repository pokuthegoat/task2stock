import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WorkEmpty } from "@/components/work/work-empty";
import { WorkList } from "@/components/work/work-list";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSession } from "@/lib/auth/session";
import { listWorkForUser } from "@/lib/data/participation";

export const metadata: Metadata = {
  title: "My Work — Task2Stock",
  description:
    "Tasks you have started and where each one stands — in progress through reward issued.",
};

export default async function WorkPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const items = await listWorkForUser(session.user.id);

  return (
    <main id="main" className="section-base flex-1">
      <section className="pt-16 pb-10 md:pt-24 md:pb-12">
        <PageContainer>
          <SectionHeading
            as="h1"
            eyebrow="Work"
            title="My Work"
            description="Every task you have started, with its current status."
          />
        </PageContainer>
      </section>

      {items.length === 0 ? <WorkEmpty /> : <WorkList items={items} />}
    </main>
  );
}
