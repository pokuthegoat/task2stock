"use server";

import { revalidatePath } from "next/cache";
import { readParticipantId } from "@/lib/auth/participant";
import { logDatabaseError } from "@/lib/data/db/errors";
import { startTaskAttempt } from "@/lib/data/participation";
import { submitUserProof } from "@/lib/proof/submit";
import type { TaskId } from "@/lib/domain/model";

type Unauthenticated = {
  ok: false;
  code: "UNAUTHENTICATED";
  error: string;
};

type WriteError = {
  ok: false;
  error: string;
};

function revalidateTaskProgress(taskId: TaskId) {
  revalidatePath(`/tasks/${taskId}/submit`);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/work");
}

async function requireUserId(): Promise<string | Unauthenticated> {
  const userId = await readParticipantId();

  if (!userId) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      error: "Sign in to submit proof.",
    };
  }

  return userId;
}

function toWriteError(scope: string, error: unknown): WriteError {
  logDatabaseError(scope, error);
  return { ok: false, error: "Unable to save your proof. Try again." };
}

export async function startTaskAttemptAction(taskId: TaskId) {
  const userId = await requireUserId();

  if (typeof userId !== "string") {
    return userId;
  }

  try {
    const attempt = await startTaskAttempt(userId, taskId);
    revalidateTaskProgress(taskId);
    return { ok: true as const, attemptId: attempt.id };
  } catch (error) {
    return toWriteError("startTaskAttempt", error);
  }
}

export async function submitProofAction(formData: FormData) {
  const taskId = String(formData.get("taskId") ?? "") as TaskId;
  const details = String(formData.get("details") ?? "");
  const blobUrl = String(formData.get("blobUrl") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "");
  const uploaded = formData.get("file");
  const file = uploaded instanceof File ? uploaded : null;

  if (!taskId) {
    return { ok: false as const, error: "This task could not be found." };
  }

  const userId = await requireUserId();

  if (typeof userId !== "string") {
    return userId;
  }

  try {
    const result = await submitUserProof({
      userId,
      taskId,
      details,
      file,
      blobUrl: blobUrl || null,
      videoUrl: videoUrl || null,
    });

    if (!result.ok) {
      return result;
    }

    revalidateTaskProgress(taskId);
    return { ok: true as const, submissionId: result.submission.id };
  } catch (error) {
    return toWriteError("submitProof", error);
  }
}
