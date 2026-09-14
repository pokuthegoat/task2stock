import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";

export default function TaskNotFound() {
  return (
    <main id="main" className="section-base flex-1 py-24 md:py-32">
      <PageContainer>
        <EmptyState
          eyebrow="Catalog"
          title="This task was not found."
          description="That ID is not in the catalog. Browse tasks to continue."
        >
          <Button href="/tasks">Back to tasks</Button>
        </EmptyState>
      </PageContainer>
    </main>
  );
}
