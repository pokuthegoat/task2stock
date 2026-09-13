import "server-only";

import {
  getCurrentAttempt,
  getProofSubmissionForAttempt,
  submitProof,
} from "@/lib/data/participation";
import type { TaskId } from "@/lib/domain/model";
import { getStorageProvider, proofStorageKey } from "@/lib/storage/provider";
import { validateProofFile } from "@/lib/proof/validate";

export async function submitUserProof(input: {
  userId: string;
  taskId: TaskId;
  details: string;
  file?: File | null;
  removeFile?: boolean;
}) {
  const details = input.details.trim();
  const attempt = await getCurrentAttempt(input.userId, input.taskId);
  const existing = attempt
    ? await getProofSubmissionForAttempt(attempt.id)
    : undefined;
  const submissionId = existing?.id ?? crypto.randomUUID();

  let fileWrite:
    | {
        fileName: string;
        contentType: string;
        size: number;
        storageKey: string;
      }
    | null
    | undefined;

  if (input.removeFile) {
    if (existing?.file) {
      await getStorageProvider().delete(existing.file.storageKey);
    }
    fileWrite = null;
  } else if (input.file && input.file.size > 0) {
    const bytes = new Uint8Array(await input.file.arrayBuffer());
    const check = validateProofFile(bytes);

    if (!check.ok) {
      return { ok: false as const, error: check.error };
    }

    const storageKey = proofStorageKey({
      userId: input.userId,
      submissionId,
      fileName: input.file.name,
    });

    if (existing?.file && existing.file.storageKey !== storageKey) {
      await getStorageProvider().delete(existing.file.storageKey);
    }

    await getStorageProvider().put({
      key: storageKey,
      bytes,
      contentType: check.contentType,
    });

    fileWrite = {
      fileName: input.file.name.slice(0, 180),
      contentType: check.contentType,
      size: bytes.byteLength,
      storageKey,
    };
  }

  const nextHasFile =
    fileWrite === undefined ? Boolean(existing?.file) : Boolean(fileWrite);

  if (!details && !nextHasFile) {
    return {
      ok: false as const,
      error: "Add a note or attach a PNG, JPEG, WEBP, or PDF file.",
    };
  }

  const submission = await submitProof(input.userId, input.taskId, {
    id: submissionId,
    details,
    file: fileWrite,
  });

  return { ok: true as const, submission };
}
