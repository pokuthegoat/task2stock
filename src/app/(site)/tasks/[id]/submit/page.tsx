import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TaskSubmit } from "@/components/tasks/task-submit";
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
}: PageProps<"/tasks/[id]/submit">): Promise<Metadata> {
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

export default async function TaskSubmitPage({
  params,
}: PageProps<"/tasks/[id]/submit">) {
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

    logDatabaseError("taskSubmit", error);
    throw error;
  }

  const progress = await getTaskProgress(session.user.id, task.id);
  const submitted = Boolean(progress.submission);

  return (
    <main id="main" className="section-base flex-1">
      <TaskSubmit
        task={task}
        initialDetails={progress.submission?.details ?? ""}
        initialVideoUrl={progress.submission?.videoUrl ?? ""}
        initialFile={
          progress.submission?.file
            ? {
                fileName: progress.submission.file.fileName,
                size: progress.submission.file.size,
                href: `/api/proofs/${progress.submission.id}`,
              }
            : null
        }
        submittedAt={progress.submission?.submittedAt ?? null}
        submitted={submitted}
      />
    </main>
  );
}
