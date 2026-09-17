import type { Metadata } from "next";
import { AdminSubmissionList } from "@/components/admin/admin-submission-list";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { listSubmissionsForAdminReview } from "@/lib/data/participation";
import { requireVerificationAdmin } from "@/lib/verification/admin-gate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submission review — Task2Stock Admin",
  description: "Review and approve or reject submitted task proofs.",
};

export default async function AdminSubmissionsPage() {
  await requireVerificationAdmin();
  const items = await listSubmissionsForAdminReview();

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-12 pt-10 md:pb-14 md:pt-16">
        <PageContainer>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="Admin"
            title="Submission review"
            description="Inspect submitted proofs and approve or reject them. Rewards are not issued from this page."
          />
        </PageContainer>
      </section>

      <section className="pb-24 md:pb-32">
        <PageContainer>
          <AdminSubmissionList items={items} />
        </PageContainer>
      </section>
    </main>
  );
}
