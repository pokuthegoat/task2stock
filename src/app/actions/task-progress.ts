"use server";

import { revalidatePath } from "next/cache";
import { readParticipantId } from "@/lib/auth/participant";
import {
  markAttemptComplete,
  saveAttemptChecklist,
  startTaskAttempt,
} from "@/lib/data/participation";
import { submitUserProof } from "@/lib/proof/submit";
import type { TaskId } from "@/lib/domain/model";

type Unauthenticated = {
  ok: false;
  code: "UNAUTHENTICATED";
  error: string;
};

function revalidateTaskProgress(taskId: TaskId) {
  revalidatePath(`/tasks/${taskId}/run`);
  revalidatePath(`/tasks/${taskId}/submit`);
  revalidatePath("/work");
}

async function requireUserId(): Promise<string | Unauthenticated> {
  const userId = await readParticipantId();

  if (!userId) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      error: "Sign in to save your progress.",
    };
  }

  return userId;
}

export async function startTaskAttemptAction(taskId: TaskId) {
  const userId = await requireUserId();

  if (typeof userId !== "string") {
    return userId;
  }

  const attempt = await startTaskAttempt(userId, taskId);
  revalidateTaskProgress(taskId);
  return { ok: true as const, attemptId: attempt.id };
}

export async function saveAttemptChecklistAction(
  taskId: TaskId,
  checkedStepIndexes: number[],
) {
  const userId = await requireUserId();

  if (typeof userId !== "string") {
    return userId;
  }

  await saveAttemptChecklist(userId, taskId, checkedStepIndexes);
  revalidateTaskProgress(taskId);
  return { ok: true as const };
}

export async function markAttemptCompleteAction(taskId: TaskId) {
  const userId = await requireUserId();

  if (typeof userId !== "string") {
    return userId;
  }

  await markAttemptComplete(userId, taskId);
  revalidateTaskProgress(taskId);
  return { ok: true as const };
}

export async function submitProofAction(formData: FormData) {
  const taskId = String(formData.get("taskId") ?? "") as TaskId;
  const details = String(formData.get("details") ?? "");
  const removeFile = String(formData.get("removeFile") ?? "") === "1";
  const uploaded = formData.get("file");
  const file = uploaded instanceof File ? uploaded : null;

  if (!taskId) {
    return { ok: false as const, error: "Missing task." };
  }

  const userId = await requireUserId();

  if (typeof userId !== "string") {
    return userId;
  }

  const result = await submitUserProof({
    userId,
    taskId,
    details,
    file,
    removeFile,
  });

  if (!result.ok) {
    return result;
  }

  revalidateTaskProgress(taskId);
  return { ok: true as const, submissionId: result.submission.id };
}
