"use server";

import { revalidatePath } from "next/cache";
import { recordManualVerificationForActor } from "@/lib/verification/record";
import { getManualVerificationActorId } from "@/lib/verification/access";
import type { SubmissionId } from "@/lib/domain/model";

/**
 * Trusted manual path. Does not call evaluateProof.
 * Automated verification stays NOT_CONNECTED.
 */
export async function recordManualVerificationAction(submissionId: SubmissionId) {
  const actorUserId = await getManualVerificationActorId();
  const result = await recordManualVerificationForActor(actorUserId, submissionId);

  if (result.ok) {
    revalidatePath(`/tasks/${result.taskId}/submit`);
    revalidatePath("/work");
  }

  return result;
}
