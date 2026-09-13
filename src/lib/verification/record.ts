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

  const verification = await setVerificationStatus(submissionId, "verified");
  return {
    ok: true as const,
    status: verification.status,
    taskId: submission.taskId,
  };
}
