import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTaskById, listTasks } from "@/lib/data/catalog";
import { TaskDetail } from "@/components/tasks/task-detail";

export async function generateStaticParams() {
  const tasks = await listTasks();
  return tasks.map((task) => ({ id: task.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tasks/[id]">): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    return {
      title: "Task not found — Task2Stock",
    };
  }

  return {
    title: `${task.title} — Task2Stock`,
    description: task.description,
  };
}

export default async function TaskDetailPage({
  params,
}: PageProps<"/tasks/[id]">) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <main id="main" className="section-base flex-1">
      <TaskDetail task={task} />
    </main>
  );
}
