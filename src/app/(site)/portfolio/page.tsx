import type { Metadata } from "next";
import { PortfolioEmpty } from "@/components/portfolio/portfolio-empty";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Portfolio — Task2Stock",
  description:
    "Your Task2Stock portfolio. Complete tasks to start building holdings.",
};

export default function PortfolioPage() {
  return (
    <main id="main" className="section-base flex-1">
      <section className="pt-16 pb-10 md:pt-24 md:pb-12">
        <PageContainer>
          <SectionHeading
            as="h1"
            eyebrow="Portfolio"
            title="Your portfolio"
            description="Complete tasks and earn stock rewards to start building your portfolio."
          />
        </PageContainer>
      </section>

      <PortfolioEmpty />
    </main>
  );
}
