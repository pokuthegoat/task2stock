import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTaskById, listTasks } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const tasks = await listTasks();
  return tasks.map((task) => ({ id: task.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tasks/[id]/run">): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    return {
      title: "Task not found — Task2Stock",
    };
  }

  return {
    title: `${task.title} — Submit proof`,
    description: `Submit proof for ${task.title}.`,
  };
}

export default async function TaskRunPage({
  params,
}: PageProps<"/tasks/[id]/run">) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  redirect(`/tasks/${task.id}/submit`);
}
