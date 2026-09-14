import "server-only";

import {
  getProofInputError,
  validateVideoProofUrl,
} from "@/lib/proof/input";
import {
  getCurrentAttempt,
  getProofSubmissionForAttempt,
  submitProof,
} from "@/lib/data/participation";
import { logDatabaseError } from "@/lib/data/db/errors";
import type { TaskId } from "@/lib/domain/model";
import { inspectOwnedBlob } from "@/lib/storage/blob";
import { getProofStorageProvider, proofStorageKey } from "@/lib/storage/provider";
import { isAllowedProofFileName } from "@/lib/proof/types";
import { validateProofFile } from "@/lib/proof/validate";

export async function submitUserProof(input: {
  userId: string;
  taskId: TaskId;
  details: string;
  file?: File | null;
  blobUrl?: string | null;
  videoUrl?: string | null;
}) {
  const details = input.details.trim();
  const attempt = await getCurrentAttempt(input.userId, input.taskId);
  const existing = attempt
    ? await getProofSubmissionForAttempt(attempt.id)
    : undefined;

  if (existing) {
    return {
      ok: false as const,
      code: "ALREADY_SUBMITTED" as const,
      error: "This task already has a proof submission.",
    };
  }

  const file = input.file && input.file.size > 0 ? input.file : null;
  const blobUrl = input.blobUrl?.trim() || null;
  const videoUrl = input.videoUrl?.trim() || "";
  const videoError = validateVideoProofUrl(videoUrl);

  if (videoError) {
    return { ok: false as const, error: videoError };
  }

  const inputError = getProofInputError({
    details,
    hasFile: Boolean(file || blobUrl),
    hasVideoUrl: Boolean(videoUrl),
  });

  if (inputError) {
    return { ok: false as const, error: inputError };
  }

  let stored: {
    fileName: string;
    contentType: string;
    size: number;
    storageKey: string;
  } | null = null;

  if (blobUrl) {
    const owned = await inspectOwnedBlob({
      userId: input.userId,
      url: blobUrl,
      kind: "proof",
    });

    if (!owned) {
      return {
        ok: false as const,
        error: "Unable to upload the image. Try again.",
      };
    }

    stored = {
      fileName: (file?.name ?? owned.pathname.split("/").pop() ?? "proof").slice(
        0,
        180,
      ),
      contentType: owned.contentType,
      size: owned.size,
      storageKey: owned.url,
    };
  } else if (file) {
    if (!isAllowedProofFileName(file.name)) {
      return {
        ok: false as const,
        error: "Use a PNG, JPEG, or WEBP image.",
      };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const check = validateProofFile(bytes);

    if (!check.ok) {
      return { ok: false as const, error: check.error };
    }

    const pathname = proofStorageKey({
      userId: input.userId,
      submissionId: crypto.randomUUID(),
      fileName: file.name,
    });

    try {
      const storageKey = await getProofStorageProvider().put({
        key: pathname,
        bytes,
        contentType: check.contentType,
      });

      stored = {
        fileName: file.name.slice(0, 180),
        contentType: check.contentType,
        size: bytes.byteLength,
        storageKey,
      };
    } catch (error) {
      logDatabaseError("proofUpload", error);
      return {
        ok: false as const,
        error: "Unable to upload the image. Try again.",
      };
    }
  }

  try {
    const submission = await submitProof(input.userId, input.taskId, {
      details,
      videoUrl,
      file: stored,
    });

    return { ok: true as const, submission };
  } catch (error) {
    if (stored) {
      try {
        await getProofStorageProvider().delete(stored.storageKey);
      } catch (cleanupError) {
        logDatabaseError("proofUploadCleanup", cleanupError);
      }
    }

    logDatabaseError("submitProof", error);
    return {
      ok: false as const,
      error: "Unable to save your proof. Try again.",
    };
  }
}
