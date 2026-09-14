"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";

export default function TaskSubmitError({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="section-base flex-1 py-24 md:py-32">
      <PageContainer>
        <EmptyState
          eyebrow="Task"
          title="This task couldn't start"
          description="Reload to try again. Your account and profile are unchanged."
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => reset()}>Reload</Button>
            <Button href="/tasks" variant="secondary">
              Back to tasks
            </Button>
          </div>
        </EmptyState>
      </PageContainer>
    </main>
  );
}
