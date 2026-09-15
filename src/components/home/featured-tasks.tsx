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
            align="center"
            eyebrow="Featured tasks"
            title="A few tasks you can start today."
            description="Each card opens the task. Proof stays pending until review."
          />
        </Reveal>
        <Reveal className="mt-14">
          <div className="home-task-grid grid gap-4 md:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} motion />
            ))}
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
