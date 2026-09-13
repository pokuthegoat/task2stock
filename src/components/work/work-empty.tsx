import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";

export function WorkEmpty() {
  return (
    <section className="pb-28">
      <PageContainer>
        <EmptyState
          eyebrow="No work yet"
          title="You haven't started any tasks yet."
          description="When you start a task, it will show up here with its current status."
        >
          <Button href="/tasks">Browse tasks</Button>
        </EmptyState>
      </PageContainer>
    </section>
  );
}
