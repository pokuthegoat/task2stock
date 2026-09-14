import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaskRun } from "@/components/tasks/task-run";
import { readParticipantId } from "@/lib/auth/participant";
import { getTaskById, listTasks } from "@/lib/data/catalog";
import {
  emptyTaskProgress,
  getTaskProgress,
  startTaskAttempt,
} from "@/lib/data/participation";

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
    title: `${task.title} — Run`,
    description: `Run ${task.title}. Completing the work does not issue stock until verification.`,
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

  const participantId = await readParticipantId();

  if (participantId) {
    await startTaskAttempt(participantId, task.id);
  }

  const progress = participantId
    ? await getTaskProgress(participantId, task.id)
    : emptyTaskProgress;

  const initialChecked = task.steps.map((_, index) =>
    Boolean(progress.attempt?.checkedStepIndexes.includes(index)),
  );

  return (
    <main id="main" className="section-base flex-1">
      <TaskRun
        task={task}
        initialChecked={initialChecked}
        complete={progress.attempt?.status === "marked_complete"}
      />
    </main>
  );
}
