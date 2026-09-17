"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { claimRewardForUser } from "@/lib/rewards/claim";
import { markRewardPaidForActor } from "@/lib/rewards/mark-paid";
import { getManualVerificationActorId } from "@/lib/verification/access";
import type { SubmissionId } from "@/lib/domain/model";
import { issueRewardForActor } from "@/lib/rewards/issue";

/**
 * Legacy trusted operator path. Marks a verified reward as paid without a claim.
 * Prefer markRewardPaidAction for the ETH payout flow.
 */
export async function issueRewardAction(submissionId: SubmissionId) {
  const actorUserId = await getManualVerificationActorId();
  const result = await issueRewardForActor(actorUserId, submissionId);

  if (result.ok) {
    revalidatePath(`/tasks/${result.taskId}/submit`);
    revalidatePath("/portfolio");
    revalidatePath("/work");
    revalidatePath("/admin/payouts");
  }

  return result;
}

/** Authenticated user claims an approved submission for manual ETH payout. */
export async function claimRewardAction(
  submissionId: SubmissionId,
  payoutWalletAddress: string,
) {
  const session = await getSession();
  const result = await claimRewardForUser(
    session?.user.id ?? null,
    submissionId,
    payoutWalletAddress,
  );

  if (result.ok) {
    revalidatePath(`/tasks/${result.taskId}/submit`);
    revalidatePath("/work");
    revalidatePath("/admin/payouts");
  }

  return result;
}

/** Admin confirms a manual treasury ETH send. */
export async function markRewardPaidAction(
  rewardId: string,
  txHash?: string | null,
) {
  const actorUserId = await getManualVerificationActorId();
  const result = await markRewardPaidForActor(actorUserId, rewardId, txHash);

  if (result.ok) {
    revalidatePath(`/tasks/${result.taskId}/submit`);
    revalidatePath("/work");
    revalidatePath("/portfolio");
    revalidatePath("/admin/payouts");
  }

  return result;
}
