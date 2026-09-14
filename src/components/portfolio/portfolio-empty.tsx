import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";

export function PortfolioEmpty() {
  return (
    <section className="pb-28">
      <PageContainer>
        <EmptyState
          eyebrow="Portfolio"
          title="Your portfolio is empty"
          description="Complete tasks and earn stock rewards to start building your portfolio."
        >
          <Button href="/tasks">Explore tasks</Button>
        </EmptyState>
      </PageContainer>
    </section>
  );
}
