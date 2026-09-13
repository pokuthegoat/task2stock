import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";

export function PortfolioEmpty() {
  return (
    <section className="pb-28">
      <PageContainer>
        <EmptyState
          eyebrow="Empty preview"
          title="No holdings yet."
          description="Completed tasks are meant to become tokenized stock positions. This empty state is for a preview account with no activity."
        >
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/tasks">Explore tasks</Button>
            <Button href="/portfolio" variant="secondary">
              View example portfolio
            </Button>
          </div>
        </EmptyState>
      </PageContainer>
    </section>
  );
}
