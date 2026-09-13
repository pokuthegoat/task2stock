import { TaskCard } from "@/components/tasks/task-card";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { TaskView } from "@/lib/data";

export function FeaturedOpportunities({ tasks }: { tasks: TaskView[] }) {
  return (
    <section className="pb-6">
      <PageContainer>
        <SectionHeading
          eyebrow="Featured"
          title="High-value opportunities."
          description="Larger rewards from the catalog."
        />
        <div className="mt-8 grid gap-px overflow-hidden rounded-[22px] border border-white/8 bg-white/8 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} badge="Featured" />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
