import "server-only";

import {
  getProofSubmissionById,
  issueReward,
} from "@/lib/data/participation";
import { canIssueManualReward } from "@/lib/verification/decision";
import type { SubmissionId } from "@/lib/domain/model";

export async function issueRewardForActor(
  actorUserId: string | null,
  submissionId: SubmissionId,
) {
  if (!actorUserId) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "Not allowed to issue a reward.",
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
    !canIssueManualReward({
      actorUserId,
      rewardUserId: submission.userId,
    })
  ) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "Not allowed to issue a reward.",
    };
  }

  try {
    const reward = await issueReward(submissionId);
    return {
      ok: true as const,
      rewardId: reward.id,
      status: reward.status,
      taskId: submission.taskId,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("only be issued after verification")
    ) {
      return {
        ok: false as const,
        code: "NOT_ELIGIBLE" as const,
        error: "Proof must be verified before a reward can be issued.",
      };
    }

    throw error;
  }
}
