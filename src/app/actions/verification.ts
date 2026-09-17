"use server";

import { revalidatePath } from "next/cache";
import {
  recordManualRejectionForActor,
  recordManualVerificationForActor,
} from "@/lib/verification/record";
import { getManualVerificationActorId } from "@/lib/verification/access";
import type { SubmissionId } from "@/lib/domain/model";

/**
 * Trusted manual path. Does not call evaluateProof.
 * Automated verification stays NOT_CONNECTED.
 * Does not issue rewards or trigger payouts.
 */
export async function recordManualVerificationAction(submissionId: SubmissionId) {
  const actorUserId = await getManualVerificationActorId();
  const result = await recordManualVerificationForActor(actorUserId, submissionId);

  if (result.ok) {
    revalidatePath(`/tasks/${result.taskId}/submit`);
    revalidatePath("/work");
    revalidatePath("/admin/submissions");
  }

  return result;
}

/**
 * Trusted manual rejection. Persists REJECTED + optional reason.
 * Does not issue rewards or trigger payouts.
 */
export async function recordManualRejectionAction(
  submissionId: SubmissionId,
  rejectionReason?: string | null,
) {
  const actorUserId = await getManualVerificationActorId();
  const result = await recordManualRejectionForActor(
    actorUserId,
    submissionId,
    rejectionReason,
  );

  if (result.ok) {
    revalidatePath(`/tasks/${result.taskId}/submit`);
    revalidatePath("/work");
    revalidatePath("/admin/submissions");
  }

  return result;
}
