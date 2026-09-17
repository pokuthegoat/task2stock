import type { Metadata } from "next";
import { AdminPayoutList } from "@/components/admin/admin-payout-list";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { listPayoutClaimsForAdmin } from "@/lib/data/participation";
import { requireVerificationAdmin } from "@/lib/verification/admin-gate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payouts — Task2Stock Admin",
  description: "Review ETH claim requests and mark manual treasury payouts.",
};

export default async function AdminPayoutsPage() {
  await requireVerificationAdmin();
  const items = await listPayoutClaimsForAdmin();

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-12 pt-10 md:pb-14 md:pt-16">
        <PageContainer>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="Admin"
            title="Payouts"
            description="Claims waiting for a manual ETH send from the treasury wallet."
          />
        </PageContainer>
      </section>

      <section className="pb-24 md:pb-32">
        <PageContainer>
          <AdminPayoutList items={items} />
        </PageContainer>
      </section>
    </main>
  );
}
