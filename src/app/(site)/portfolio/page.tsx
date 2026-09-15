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
      <section className="pb-12 pt-10 md:pb-14 md:pt-16">
        <PageContainer>
          <SectionHeading
            as="h1"
            align="center"
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
