import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaskSubmit } from "@/components/tasks/task-submit";
import { readParticipantId } from "@/lib/auth/participant";
import { getTaskById, listTasks } from "@/lib/data/catalog";
import { emptyTaskProgress, getTaskProgress } from "@/lib/data/participation";

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
    description: `Submit proof for ${task.title}.`
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

  const participantId = await readParticipantId();
  const progress = participantId
    ? await getTaskProgress(participantId, task.id)
    : emptyTaskProgress;
  const submitted = Boolean(progress.submission);
  const verified = progress.verification?.status === "verified";
  const issuedReward =
    progress.reward?.status === "issued" ? progress.reward : null;

  return (
    <main id="main" className="section-base flex-1">
      <TaskSubmit
        task={task}
        initialDetails={progress.submission?.details ?? ""}
        initialFile={
          progress.submission?.file
            ? {
                fileName: progress.submission.file.fileName,
                size: progress.submission.file.size,
                href: `/api/proofs/${progress.submission.id}`,
              }
            : null
        }
        submitted={submitted}
        verified={verified}
        issued={Boolean(issuedReward)}
        issuedReward={
          issuedReward
            ? {
                amountCents: issuedReward.amountCents,
                ticker: issuedReward.ticker,
              }
            : null
        }
      />
    </main>
  );
}
