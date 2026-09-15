"use server";

import { revalidatePath } from "next/cache";
import { issueRewardForActor } from "@/lib/rewards/issue";
import { getManualVerificationActorId } from "@/lib/verification/access";
import type { SubmissionId } from "@/lib/domain/model";

/**
 * Trusted operator path. Marks a verified reward as issued.
 * Does not pay or settle. Payouts go through the user's Privy wallet, not Task2Stock.
 */
export async function issueRewardAction(submissionId: SubmissionId) {
  const actorUserId = await getManualVerificationActorId();
  const result = await issueRewardForActor(actorUserId, submissionId);

  if (result.ok) {
    revalidatePath(`/tasks/${result.taskId}/submit`);
    revalidatePath("/portfolio");
    revalidatePath("/work");
  }

  return result;
}
