import "server-only";

import {
  getProofSubmissionById,
  setVerificationStatus,
} from "@/lib/data/participation";
import { canRecordManualVerification } from "@/lib/verification/decision";
import type { SubmissionId } from "@/lib/domain/model";

export async function recordManualVerificationForActor(
  actorUserId: string | null,
  submissionId: SubmissionId,
) {
  if (!actorUserId) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "Not allowed to record a verification decision.",
    };
  }

  const submission = await getProofSubmissionById(submissionId);

  if (!submission) {
    return {
      ok: false as const,
      code: "NOT_FOUND" as const,
      error: "Proof submission not found.",
    };
  }

  if (
    !canRecordManualVerification({
      actorUserId,
      submissionUserId: submission.userId,
    })
  ) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "Not allowed to record a verification decision.",
    };
  }

  try {
    const verification = await setVerificationStatus(submissionId, "verified");
    return {
      ok: true as const,
      status: verification.status,
      taskId: submission.taskId,
      rejectionReason: verification.rejectionReason,
    };
  } catch (error) {
    return {
      ok: false as const,
      code: "INVALID_STATE" as const,
      error:
        error instanceof Error
          ? error.message
          : "Submission is not reviewable.",
    };
  }
}

export async function recordManualRejectionForActor(
  actorUserId: string | null,
  submissionId: SubmissionId,
  rejectionReason?: string | null,
) {
  if (!actorUserId) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "Not allowed to record a verification decision.",
    };
  }

  const submission = await getProofSubmissionById(submissionId);

  if (!submission) {
    return {
      ok: false as const,
      code: "NOT_FOUND" as const,
      error: "Proof submission not found.",
    };
  }

  if (
    !canRecordManualVerification({
      actorUserId,
      submissionUserId: submission.userId,
    })
  ) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "Not allowed to record a verification decision.",
    };
  }

  try {
    const verification = await setVerificationStatus(submissionId, "rejected", {
      rejectionReason,
    });
    return {
      ok: true as const,
      status: verification.status,
      taskId: submission.taskId,
      rejectionReason: verification.rejectionReason,
    };
  } catch (error) {
    return {
      ok: false as const,
      code: "INVALID_STATE" as const,
      error:
        error instanceof Error
          ? error.message
          : "Submission is not reviewable.",
    };
  }
}
