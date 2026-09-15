import { TaskCard } from "@/components/tasks/task-card";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { TaskView } from "@/lib/data";

export function FeaturedOpportunities({ tasks }: { tasks: TaskView[] }) {
  return (
    <section className="pb-8">
      <PageContainer>
        <SectionHeading
          align="center"
          eyebrow="Featured"
          title="High-value opportunities."
          description="Larger rewards from the catalog."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} badge="Featured" />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
