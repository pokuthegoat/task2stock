import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TaskRun } from "@/components/tasks/task-run";
import { PROFILE_SETUP_PATH } from "@/lib/auth/profile-gate";
import { getSession } from "@/lib/auth/session";
import { getTaskById, listTasks } from "@/lib/data/catalog";
import { logDatabaseError } from "@/lib/data/db/errors";
import { getTaskProgress, startTaskAttempt } from "@/lib/data/participation";

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

  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.username) {
    redirect(PROFILE_SETUP_PATH);
  }

  try {
    await startTaskAttempt(session.user.id, task.id);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unknown task")) {
      notFound();
    }

    logDatabaseError("taskRun", error);
    throw error;
  }

  const progress = await getTaskProgress(session.user.id, task.id);

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
