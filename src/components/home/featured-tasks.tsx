import { TaskCard } from "@/components/tasks/task-card";
import { PageContainer } from "@/components/ui/page-container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { TaskView } from "@/lib/data";

export function FeaturedTasks({ tasks }: { tasks: TaskView[] }) {
  return (
    <section id="tasks" className="section-lift py-16 md:py-24">
      <PageContainer>
        <Reveal>
          <SectionHeading
            eyebrow="Featured tasks"
            title="A few tasks from the catalog."
            description="These are existing listings. Each card opens the task detail page."
          />
        </Reveal>
        <Reveal className="mt-12">
          <div className="grid gap-px overflow-hidden rounded-[22px] border border-white/8 bg-white/8 md:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
